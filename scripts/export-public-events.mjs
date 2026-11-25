import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exportPublicEvents } from "../cms/server/exportPublic.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const storeFile = path.join(root, "cms", "server", "data", "store.json");

if (!fs.existsSync(storeFile)) {
  console.log("No local event store. Using the committed published events.");
} else {
  const result = exportPublicEvents();
  console.log(`Published ${result.count} event(s) for the static site.`);
}
