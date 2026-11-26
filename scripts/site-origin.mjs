import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { SITE_ORIGIN } from "../cms/shared/siteOrigin.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function envValue(name) {
  if (process.env[name]) return process.env[name];
  const file = path.join(root, "cms", ".env");
  if (!fs.existsSync(file)) return "";
  const line = fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(`${name}=`));
  return line ? line.slice(name.length + 1).trim() : "";
}

export function siteOrigin() {
  const configured = envValue("VITE_SITE_URL").replace(/\/$/, "");
  if (configured) return configured;
  return SITE_ORIGIN;
}
