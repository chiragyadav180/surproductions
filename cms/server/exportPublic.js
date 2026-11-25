import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(serverDir, "../..");
const storeFile = path.join(serverDir, "data", "store.json");
const outFile = path.join(root, "fe", "data", "published-events.json");
const uploadDir = path.join(root, "public", "uploads");
const imageDir = path.join(root, "public", "images", "events");

function rewriteUploads(value, copies) {
  if (typeof value === "string" && value.startsWith("/uploads/")) {
    const filename = path.basename(value);
    if (!filename || filename === "." || filename === "..") return "";
    copies.add(filename);
    return `/images/events/${filename}`;
  }
  if (Array.isArray(value)) return value.map((item) => rewriteUploads(item, copies));
  if (value && typeof value === "object") {
    const next = {};
    for (const [key, child] of Object.entries(value)) next[key] = rewriteUploads(child, copies);
    return next;
  }
  return value;
}

export function exportPublicEvents(data) {
  const source = data || JSON.parse(fs.readFileSync(storeFile, "utf8"));
  const copies = new Set();
  const events = (Array.isArray(source.events) ? source.events : [])
    .filter((item) => item.publicationStatus === "published")
    .map((event) => rewriteUploads(event, copies));

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify({ events }, null, 2)}\n`);

  fs.mkdirSync(imageDir, { recursive: true });
  for (const filename of copies) {
    const from = path.join(uploadDir, filename);
    if (!fs.existsSync(from)) continue;
    fs.copyFileSync(from, path.join(imageDir, filename));
  }

  return { count: events.length, images: copies.size };
}
