import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exportPublicEvents, publishedDocument } from "./exportPublic.js";
import { githubConfigured, readEvents, readImage, writeEvents, writeImage } from "./githubStore.js";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(serverDir, "../..");
const storeFile = path.join(serverDir, "data", "store.json");
const eventsFile = path.join(root, "cms", "data", "events.json");
const imageDir = path.join(root, "public", "images", "events");

const emptyLocal = () => ({ users: [], sessions: [], events: [], audit: [] });

function fail(message, status = 503) {
  const error = new Error(message);
  error.status = status;
  error.expose = true;
  return error;
}

function readLocal() {
  try {
    const data = JSON.parse(fs.readFileSync(storeFile, "utf8"));
    return {
      users: Array.isArray(data.users) ? data.users : [],
      sessions: Array.isArray(data.sessions) ? data.sessions : [],
      events: Array.isArray(data.events) ? data.events : [],
      audit: Array.isArray(data.audit) ? data.audit : [],
    };
  } catch {
    return emptyLocal();
  }
}

function writeLocal(next) {
  try {
    const current = readLocal();
    fs.mkdirSync(path.dirname(storeFile), { recursive: true });
    fs.writeFileSync(
      storeFile,
      JSON.stringify(
        {
          users: next.users ?? current.users,
          sessions: [],
          events: current.events,
          audit: next.audit ?? current.audit,
        },
        null,
        2,
      ),
    );
  } catch {
    /* A read-only deploy keeps the administrator in environment variables. */
  }
}

function readEventsFile() {
  try {
    const data = JSON.parse(fs.readFileSync(eventsFile, "utf8"));
    if (Array.isArray(data.events)) return data.events;
  } catch {
    /* Fall through to the local studio file. */
  }
  return readLocal().events;
}

function useGithub() {
  return Boolean(process.env.VERCEL && githubConfigured());
}

export function storageMode() {
  if (useGithub()) return "github";
  if (process.env.VERCEL) return "readonly";
  return "disk";
}

function mirrorStoreEvents(events) {
  try {
    const current = readLocal();
    current.events = events;
    fs.mkdirSync(path.dirname(storeFile), { recursive: true });
    fs.writeFileSync(storeFile, JSON.stringify(current, null, 2));
  } catch {
    /* The studio copy is optional. cms/data/events.json is the saved event list. */
  }
}

async function persistEvents(events) {
  if (process.env.VERCEL) {
    if (!process.env.GITHUB_TOKEN) {
      throw fail(
        "Add GITHUB_TOKEN in Vercel so publishing can save events. Hostinger saves to the server disk and does not need that token.",
      );
    }
    if (!githubConfigured()) throw fail("Connect the Vercel project to GitHub before publishing.");
    await writeEvents(events, publishedDocument(events).json);
    return;
  }
  fs.mkdirSync(path.dirname(eventsFile), { recursive: true });
  fs.writeFileSync(eventsFile, `${JSON.stringify({ events }, null, 2)}\n`);
  mirrorStoreEvents(events);
  try {
    exportPublicEvents({ events });
  } catch {
    /* The live studio still serves the saved event. */
  }
}

export async function load() {
  const local = readLocal();
  const events = useGithub() ? await readEvents() : readEventsFile();
  return {
    users: local.users,
    sessions: [],
    events,
    audit: local.audit,
  };
}

let chain = Promise.resolve();

export function update(mutator) {
  const run = chain.then(async () => {
    const data = await load();
    const eventsBefore = JSON.stringify(data.events);
    const usersBefore = JSON.stringify(data.users);
    const auditBefore = JSON.stringify(data.audit);
    const result = await mutator(data);
    if (JSON.stringify(data.events) !== eventsBefore) await persistEvents(data.events);
    if (JSON.stringify(data.users) !== usersBefore || JSON.stringify(data.audit) !== auditBefore) {
      writeLocal({ users: data.users, audit: data.audit });
    }
    return result;
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function safeMediaName(filename) {
  const name = path.basename(String(filename || ""));
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) return "";
  return name;
}

export async function saveMedia(filename, buffer) {
  const name = safeMediaName(filename);
  if (!name) throw fail("Choose an image to upload.", 400);
  if (process.env.VERCEL) {
    if (!process.env.GITHUB_TOKEN) {
      throw fail(
        "Add GITHUB_TOKEN in Vercel so image uploads can be saved. Hostinger stores images on the server disk.",
      );
    }
    if (!githubConfigured()) throw fail("Connect the Vercel project to GitHub before uploading images.");
    await writeImage(name, buffer);
    return `/api/media/${name}`;
  }
  fs.mkdirSync(imageDir, { recursive: true });
  fs.writeFileSync(path.join(imageDir, name), buffer);
  return `/api/media/${name}`;
}

export async function openMedia(filename) {
  const name = safeMediaName(filename);
  if (!name) return null;
  const local = path.join(imageDir, name);
  if (fs.existsSync(local)) return fs.readFileSync(local);
  const upload = path.join(root, "public", "uploads", name);
  if (fs.existsSync(upload)) return fs.readFileSync(upload);
  if (useGithub()) return readImage(name);
  return null;
}

export const paths = {
  root,
  store: storeFile,
  uploads: path.join(root, "public", "uploads"),
  images: imageDir,
};
