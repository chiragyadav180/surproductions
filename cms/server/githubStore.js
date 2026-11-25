const TTL = 3000;
let chain = Promise.resolve();
let cached = { at: 0, events: null };

function fail(message, status) {
  const error = new Error(message);
  error.status = status;
  error.expose = true;
  return error;
}

function repo() {
  const owner = process.env.GITHUB_REPO_OWNER || process.env.VERCEL_GIT_REPO_OWNER || "";
  const name = process.env.GITHUB_REPO_NAME || process.env.VERCEL_GIT_REPO_SLUG || "";
  const branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "main";
  if (!owner || !name) throw fail("The repository name is missing on this deployment.", 503);
  return { owner, name, branch };
}

export function githubConfigured() {
  return Boolean(process.env.GITHUB_TOKEN && (process.env.GITHUB_REPO_OWNER || process.env.VERCEL_GIT_REPO_OWNER));
}

function queued(task) {
  const run = chain.then(task, task);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function request(pathname, options = {}) {
  const response = await fetch(`https://api.github.com${pathname}`, {
    method: options.method || "GET",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "User-Agent": "sur-productions",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
    },
    body: options.body,
  });
  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!response.ok) {
    throw fail(messageFor(response.status), response.status);
  }
  return data;
}

function messageFor(status) {
  if (status === 401) return "GITHUB_TOKEN was rejected. Use a token that can edit this repository.";
  if (status === 403 || status === 404) return "GITHUB_TOKEN cannot edit this repository branch.";
  return "The event could not be saved to the repository. Try again.";
}

async function commitOnce(files, message) {
  const { owner, name, branch } = repo();
  const base = `/repos/${owner}/${name}`;
  const ref = await request(`/repos/${owner}/${name}/git/ref/heads/${encodeURIComponent(branch)}`);
  const parent = ref.object.sha;
  const current = await request(`${base}/git/commits/${parent}`);
  const blobs = [];
  for (const file of files) {
    const blob = await request(`${base}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({ content: file.base64, encoding: "base64" }),
    });
    blobs.push({ path: file.path, mode: "100644", type: "blob", sha: blob.sha });
  }
  const tree = await request(`${base}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: current.tree.sha, tree: blobs }),
  });
  const commit = await request(`${base}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: tree.sha, parents: [parent] }),
  });
  await request(`${base}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });
}

async function commitFiles(files, message) {
  try {
    await commitOnce(files, message);
  } catch (error) {
    if (error.status !== 409 && error.status !== 422) throw error;
    await commitOnce(files, message);
  }
}

async function fetchEvents() {
  const { owner, name, branch } = repo();
  try {
    const item = await request(
      `/repos/${owner}/${name}/contents/cms/data/events.json?ref=${encodeURIComponent(branch)}`,
    );
    const json = JSON.parse(Buffer.from(String(item.content || "").replace(/\n/g, ""), "base64").toString("utf8"));
    return Array.isArray(json.events) ? json.events : [];
  } catch (error) {
    if (error.status === 404) return [];
    throw error;
  }
}

export async function readEvents() {
  if (cached.events && Date.now() - cached.at < TTL) return structuredClone(cached.events);
  const events = await fetchEvents();
  cached = { at: Date.now(), events };
  return structuredClone(events);
}

export async function writeEvents(events, snapshot) {
  await queued(() =>
    commitFiles(
      [
        {
          path: "cms/data/events.json",
          base64: Buffer.from(`${JSON.stringify({ events }, null, 2)}\n`, "utf8").toString("base64"),
        },
        {
          path: "fe/data/published-events.json",
          base64: Buffer.from(snapshot, "utf8").toString("base64"),
        },
      ],
      "Update studio events",
    ),
  );
  cached = { at: Date.now(), events: structuredClone(events) };
}

export async function readImage(filename) {
  const { owner, name, branch } = repo();
  try {
    const item = await request(
      `/repos/${owner}/${name}/contents/public/images/events/${encodeURIComponent(filename)}?ref=${encodeURIComponent(branch)}`,
    );
    if (item.content) return Buffer.from(String(item.content).replace(/\n/g, ""), "base64");
    const blob = await request(`/repos/${owner}/${name}/git/blobs/${item.sha}`);
    return Buffer.from(String(blob.content || "").replace(/\n/g, ""), "base64");
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function writeImage(filename, buffer) {
  await queued(() =>
    commitFiles(
      [
        {
          path: `public/images/events/${filename}`,
          base64: Buffer.from(buffer).toString("base64"),
        },
      ],
      "Add studio image",
    ),
  );
}
