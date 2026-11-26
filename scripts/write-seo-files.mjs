import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { llmsTxt, robotsTxt, sitemapXml } from "../cms/shared/publicSeo.js";
import { siteOrigin } from "./site-origin.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function publishedEvents() {
  const file = path.join(root, "fe", "data", "published-events.json");
  if (!fs.existsSync(file)) return [];
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  return (data.events || []).filter((event) => event.publicationStatus === "published");
}

const origin = siteOrigin();
const events = publishedEvents();
const publicDir = path.join(root, "public");
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapXml(origin, events));
fs.writeFileSync(path.join(publicDir, "robots.txt"), robotsTxt(origin));
fs.writeFileSync(path.join(publicDir, "llms.txt"), llmsTxt(origin, events));
console.log(
  `Wrote sitemap.xml, robots.txt and llms.txt for ${events.length} event(s)${origin ? ` at ${origin}` : ""}.`,
);
