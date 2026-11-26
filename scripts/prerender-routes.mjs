import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  absolutePublicUrl,
  documentTitle,
  eventJsonLd,
  eventSeoDescription,
  eventSeoTitle,
  eventsIndexDescription,
  eventsItemList,
  stampIndexHtml,
} from "../cms/shared/publicSeo.js";
import { siteOrigin } from "./site-origin.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const shellPath = path.join(dist, "index.html");

if (!fs.existsSync(shellPath)) {
  console.log("No built index.html. Skipping search-page stamps.");
  process.exit(0);
}

const shell = fs.readFileSync(shellPath, "utf8");
const eventsFile = path.join(root, "fe", "data", "published-events.json");
const events = fs.existsSync(eventsFile)
  ? (JSON.parse(fs.readFileSync(eventsFile, "utf8")).events || []).filter(
      (event) => event.publicationStatus === "published",
    )
  : [];
const origin = siteOrigin();

function imageUrl(event) {
  const image = event.heroImage || event.coverImage || "";
  if (!image || !origin) return "";
  return /^https?:\/\//i.test(image) ? image : absolutePublicUrl(origin, image);
}

fs.mkdirSync(path.join(dist, "events"), { recursive: true });
fs.writeFileSync(
  path.join(dist, "events", "index.html"),
  stampIndexHtml(shell, {
    title: documentTitle("Events"),
    description: eventsIndexDescription(events),
    canonical: origin ? absolutePublicUrl(origin, "/events") : "",
    jsonLd: eventsItemList(events, origin),
  }),
);

for (const event of events) {
  const dir = path.join(dist, "events", event.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "index.html"),
    stampIndexHtml(shell, {
      title: documentTitle(eventSeoTitle(event)),
      description: eventSeoDescription(event),
      canonical: origin ? absolutePublicUrl(origin, `/events/${event.slug}`) : "",
      image: imageUrl(event),
      jsonLd: eventJsonLd(event, origin),
    }),
  );
}

console.log(`Stamped search tags for /events and ${events.length} event page(s).`);
