import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exportPublicEvents } from "./exportPublic.js";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(serverDir, "../..");
const file = path.join(serverDir, "data", "store.json");

const empty = () => ({ users: [], sessions: [], events: [], audit: [] });

function read() {
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    return {
      users: Array.isArray(data.users) ? data.users : [],
      sessions: Array.isArray(data.sessions) ? data.sessions : [],
      events: Array.isArray(data.events) ? data.events : [],
      audit: Array.isArray(data.audit) ? data.audit : [],
    };
  } catch {
    return empty();
  }
}

function write(data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
  exportPublicEvents(data);
}

let chain = Promise.resolve();

export function update(mutator) {
  const run = chain.then(() => {
    const data = read();
    const now = Date.now();
    data.sessions = data.sessions.filter((session) => session.expiresAt > now);
    const result = mutator(data);
    write(data);
    return result;
  });
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function readState() {
  return update((data) => data);
}

export const paths = {
  root,
  store: file,
  uploads: path.join(root, "public", "uploads"),
};
