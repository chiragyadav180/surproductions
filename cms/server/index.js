import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import multer from "multer";
import { createId, normalizeEvent, slugify } from "../shared/event.js";
import { llmsTxt, robotsTxt, sitemapXml } from "../shared/publicSeo.js";
import { ALLOWED_ORIGINS, SITE_ORIGIN } from "../shared/siteOrigin.js";
import { load, openMedia, paths, saveMedia, storageMode, update } from "./store.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
loadEnv(path.join(root, "cms", ".env"));

const PORT = Number(process.env.PORT || 3001);
const SESSION_MS = 1000 * 60 * 60 * 12;
const isProd = process.env.NODE_ENV === "production";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
for (const method of ["get", "post", "put", "delete"]) {
  const original = app[method].bind(app);
  app[method] = (route, ...handlers) =>
    original(
      route,
      ...handlers.map((handler) =>
        handler.length >= 4
          ? handler
          : (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next),
      ),
    );
}
app.use((req, res, next) => {
  const host = String(req.headers["x-forwarded-host"] || req.get("host") || "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  if (host === "www.surproductions.com") {
    return res.redirect(301, `${SITE_ORIGIN}${req.originalUrl}`);
  }
  next();
});

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  const origin = req.get("origin");
  if (origin && allowedOrigin(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-csrf-token");
  }
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

try {
  fs.mkdirSync(paths.uploads, { recursive: true });
  fs.mkdirSync(paths.images, { recursive: true });
} catch {
  /* The deploy filesystem can be read-only. Saved images are served by the media route. */
}
app.use("/uploads", express.static(paths.uploads, { maxAge: isProd ? "7d" : 0 }));
app.use("/images", express.static(path.join(root, "public", "images"), { maxAge: isProd ? "7d" : 0 }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, storage: storageMode() });
});

app.get("/api/media/:file", async (req, res) => {
  const file = await openMedia(req.params.file);
  if (!file) return res.status(404).end();
  res.setHeader("Content-Type", mediaType(req.params.file));
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.end(file);
});

const attempts = new Map();

await ensureAdmin();

function requireAdmin(req, res, next) {
  const session = readSession(readCookie(req, "sur_session"));
  if (!session) return res.status(401).json({ error: "Sign in required." });
  req.admin = session;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const header = req.get("x-csrf-token") || "";
    if (!safeEqual(header, session.csrf)) {
      return res.status(403).json({ error: "This form expired. Refresh the page and try again." });
    }
  }
  next();
}

app.post("/api/admin/login", async (req, res) => {
  const ip = req.ip || "local";
  if (tooManyAttempts(ip)) {
    return res.status(429).json({ error: "Too many attempts. Wait a few minutes and try again." });
  }
  if (!sessionSecret()) {
    return res.status(503).json({ error: "Set SESSION_SECRET in the hosting environment before signing in." });
  }
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const data = await load();
  if (!data.users.length && !process.env.ADMIN_BOOTSTRAP_PASSWORD) {
    return res.status(503).json({
      error: "Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD in the hosting environment.",
    });
  }
  if (!matchesAdmin(email, password, data)) {
    noteAttempt(ip);
    return res.status(401).json({ error: "Those details do not match an administrator account." });
  }
  clearAttempts(ip);
  const csrf = randomBytes(24).toString("hex");
  setSessionCookie(req, res, signSession({ email, csrf, exp: Date.now() + SESSION_MS }));
  try {
    await update((state) => {
      pushAudit(state, "login", email);
    });
  } catch {
    /* Sign-in still succeeds when the audit note cannot be stored. */
  }
  res.json({ email, csrf });
});

app.post("/api/admin/logout", requireAdmin, async (req, res) => {
  res.append("Set-Cookie", "sur_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
  res.json({ ok: true });
});

app.get("/api/admin/me", requireAdmin, (req, res) => {
  res.json({ email: req.admin.email, csrf: req.admin.csrf });
});

app.get("/api/admin/overview", requireAdmin, async (req, res) => {
  const data = await load();
  const events = data.events;
  res.json({
    stats: {
      total: events.length,
      published: events.filter((item) => item.publicationStatus === "published").length,
      draft: events.filter((item) => item.publicationStatus === "draft").length,
      archived: events.filter((item) => item.publicationStatus === "archived").length,
      upcoming: events.filter((item) => item.eventStatus === "upcoming").length,
    },
    recent: [...events]
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
      .slice(0, 6)
      .map(summary),
    audit: data.audit.slice(0, 8),
  });
});

app.get("/api/admin/events", requireAdmin, async (req, res) => {
  const data = await load();
  const events = [...data.events].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  res.json({ events: events.map(summary) });
});

app.get("/api/admin/events/:id", requireAdmin, async (req, res) => {
  const data = await load();
  const event = data.events.find((item) => item.id === req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found." });
  res.json({ event });
});

app.post("/api/admin/events", requireAdmin, async (req, res) => {
  const normalized = normalizeEvent(req.body);
  if (normalized.error) return res.status(400).json({ error: normalized.error });
  const saved = await update((data) => {
    const event = stamp(normalized.event, null, data.events);
    data.events.push(event);
    pushAudit(data, "create", event.title);
    return event;
  });
  res.status(201).json({ event: saved });
});

app.put("/api/admin/events/:id", requireAdmin, async (req, res) => {
  const normalized = normalizeEvent(req.body);
  if (normalized.error) return res.status(400).json({ error: normalized.error });
  const saved = await update((data) => {
    const index = data.events.findIndex((item) => item.id === req.params.id);
    if (index < 0) return null;
    const previous = data.events[index];
    const event = stamp(normalized.event, previous, data.events);
    data.events[index] = event;
    const action =
      previous.publicationStatus !== event.publicationStatus
        ? event.publicationStatus === "published"
          ? "publish"
          : "unpublish"
        : "update";
    pushAudit(data, action, event.title);
    return event;
  });
  if (!saved) return res.status(404).json({ error: "Event not found." });
  res.json({ event: saved });
});

app.delete("/api/admin/events/:id", requireAdmin, async (req, res) => {
  const removed = await update((data) => {
    const event = data.events.find((item) => item.id === req.params.id);
    if (!event) return null;
    data.events = data.events.filter((item) => item.id !== req.params.id);
    pushAudit(data, "delete", event.title);
    return event;
  });
  if (!removed) return res.status(404).json({ error: "Event not found." });
  res.json({ ok: true });
});

app.post("/api/admin/events/:id/duplicate", requireAdmin, async (req, res) => {
  const copy = await update((data) => {
    const event = data.events.find((item) => item.id === req.params.id);
    if (!event) return null;
    const duplicate = {
      ...structuredClone(event),
      id: createId(),
      title: `${event.title} copy`.slice(0, 180),
      slug: uniqueSlug(data.events, `${event.slug}-copy`, ""),
      publicationStatus: "draft",
      featured: false,
      homepage: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.events.push(duplicate);
    pushAudit(data, "create", duplicate.title);
    return duplicate;
  });
  if (!copy) return res.status(404).json({ error: "Event not found." });
  res.status(201).json({ event: copy });
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Upload a JPG, PNG, WEBP or GIF image."));
  },
});

app.post("/api/admin/media", requireAdmin, (req, res) => {
  upload.single("file")(req, res, async (error) => {
    if (error) {
      const message = error.code === "LIMIT_FILE_SIZE" ? "Images need to be 4 MB or smaller." : error.message;
      return res.status(400).json({ error: message || "Upload failed." });
    }
    if (!req.file) return res.status(400).json({ error: "Choose an image to upload." });
    try {
      const ext = path.extname(req.file.originalname || "").toLowerCase();
      const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) ? ext : ".jpg";
      const filename = `${Date.now()}-${randomBytes(4).toString("hex")}${safeExt}`;
      const url = await saveMedia(filename, req.file.buffer);
      res.status(201).json({ url });
    } catch (err) {
      const status = err.status || 500;
      res.status(status).json({ error: err.expose ? err.message : "Upload failed." });
    }
  });
});

app.get("/api/events", async (req, res) => {
  const data = await load();
  const events = data.events
    .filter((item) => item.publicationStatus === "published")
    .sort((a, b) => Number(b.featured) - Number(a.featured) || String(a.startDate).localeCompare(String(b.startDate)));
  res.json({ events });
});

app.get("/api/events/:slug", async (req, res) => {
  if (!/^[a-z0-9-]{1,80}$/.test(req.params.slug)) {
    return res.status(404).json({ error: "Event not found." });
  }
  const data = await load();
  const event = data.events.find(
    (item) => item.slug === req.params.slug && item.publicationStatus === "published",
  );
  if (!event) return res.status(404).json({ error: "Event not found." });
  const related = data.events
    .filter((item) => item.publicationStatus === "published" && item.id !== event.id)
    .slice(0, 3);
  res.json({ event, related });
});

app.get("/sitemap.xml", async (req, res) => {
  const data = await load();
  res.type("application/xml");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.send(sitemapXml(requestOrigin(req), publishedEvents(data)));
});

app.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.send(robotsTxt(requestOrigin(req)));
});

app.get("/llms.txt", async (req, res) => {
  const data = await load();
  res.type("text/plain");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.send(llmsTxt(requestOrigin(req), publishedEvents(data)));
});

function publishedEvents(data) {
  return (data.events || []).filter((event) => event.publicationStatus === "published");
}

function allowedOrigin(origin) {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  const configured = String(process.env.VITE_SITE_URL || "").replace(/\/$/, "");
  return Boolean(configured) && origin === configured;
}

function requestOrigin(req) {
  const configured = String(process.env.VITE_SITE_URL || "").replace(/\/$/, "");
  if (configured) return configured;
  if (isProd) return SITE_ORIGIN;
  const host = String(req.headers["x-forwarded-host"] || req.get("host") || "")
    .split(",")[0]
    .trim();
  if (!/^[a-z0-9.-]+(?::\d+)?$/i.test(host)) return SITE_ORIGIN;
  const forwarded = String(req.headers["x-forwarded-proto"] || req.protocol || "https")
    .split(",")[0]
    .trim();
  const proto = forwarded === "http" ? "http" : "https";
  return `${proto}://${host}`;
}

if (isProd && !process.env.VERCEL) {
  const dist = path.join(root, "dist");
  app.get("/events/:slug", (req, res, next) => {
    if (!/^[a-z0-9-]{1,80}$/.test(req.params.slug)) return next();
    const file = path.resolve(dist, "events", req.params.slug, "index.html");
    const eventsDir = path.resolve(dist, "events") + path.sep;
    if (!file.startsWith(eventsDir) || !fs.existsSync(file)) return next();
    res.sendFile(file);
  });
  app.get("/events", (req, res, next) => {
    const file = path.join(dist, "events", "index.html");
    if (!fs.existsSync(file)) return next();
    res.sendFile(file);
  });
  app.use(express.static(dist));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
    res.sendFile(path.join(dist, "index.html"), (error) => (error ? next() : undefined));
  });
}

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "Not found." });
  next();
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = Number(error.status) || 500;
  const message = error.expose ? error.message : "Something went wrong. Try again.";
  res.status(status).json({ error: message });
});

export default app;

if (!process.env.VERCEL && !globalThis.__surListening) {
  globalThis.__surListening = true;
  app.listen(PORT, () => {
    console.log(`SUR API listening on http://localhost:${PORT}`);
  });
}

function stamp(event, previous, events) {
  return {
    ...event,
    id: previous?.id || createId(),
    slug: uniqueSlug(events, event.slug || slugify(event.title), previous?.id || ""),
    createdAt: previous?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function uniqueSlug(events, slug, id) {
  const base = slug || "event";
  let next = base;
  let count = 2;
  while (events.some((item) => item.slug === next && item.id !== id)) {
    next = `${base}-${count++}`;
  }
  return next;
}

function summary(event) {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    category: event.category,
    eventStatus: event.eventStatus,
    publicationStatus: event.publicationStatus,
    featured: event.featured,
    homepage: event.homepage,
    startDate: event.startDate,
    dateStatus: event.dateStatus,
    tentativeDateText: event.tentativeDateText,
    city: event.city,
    updatedAt: event.updatedAt,
    thumbnail: event.thumbnail || event.coverImage || event.heroImage || "",
  };
}

function pushAudit(data, action, detail) {
  data.audit.unshift({ id: createId(), action, detail, at: new Date().toISOString() });
  data.audit = data.audit.slice(0, 200);
}

function sessionSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (!isProd) return "local-dev-only-change-before-deploy";
  return "";
}

function signSession(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", sessionSecret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function readSession(token) {
  const secret = sessionSecret();
  if (!secret || !token || !token.includes(".")) return null;
  const [body, signature] = token.split(".");
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  if (!safeEqual(signature, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!data?.email || !data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

function matchesAdmin(email, password, data) {
  const user = (data.users || []).find((item) => item.email === email);
  if (user && verifyPassword(password, user.passwordHash)) return true;
  const envEmail = String(process.env.ADMIN_BOOTSTRAP_EMAIL || "").trim().toLowerCase();
  const envPassword = String(process.env.ADMIN_BOOTSTRAP_PASSWORD || "");
  if (!envEmail || !envPassword) return false;
  return email === envEmail && safeEqualString(password, envPassword);
}

function setSessionCookie(req, res, token) {
  const https = req.secure || req.headers["x-forwarded-proto"] === "https";
  const secure = https ? "; Secure" : "";
  res.append(
    "Set-Cookie",
    `sur_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_MS / 1000)}${secure}`,
  );
}

function mediaType(filename) {
  const ext = path.extname(filename || "").toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

function readCookie(req, name) {
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return "";
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (!left.length || left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function safeEqualString(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) {
    timingSafeEqual(left, left);
    return false;
  }
  return timingSafeEqual(left, right);
}

function noteAttempt(ip) {
  const now = Date.now();
  const entry = attempts.get(ip) || [];
  attempts.set(
    ip,
    entry.filter((time) => now - time < 15 * 60 * 1000).concat(now),
  );
}

function clearAttempts(ip) {
  attempts.delete(ip);
}

function tooManyAttempts(ip) {
  const now = Date.now();
  const entry = (attempts.get(ip) || []).filter((time) => now - time < 15 * 60 * 1000);
  attempts.set(ip, entry);
  return entry.length >= 8;
}

async function ensureAdmin() {
  const email = String(process.env.ADMIN_BOOTSTRAP_EMAIL || (isProd ? "" : "admin@sur.local"))
    .trim()
    .toLowerCase();
  const password = String(process.env.ADMIN_BOOTSTRAP_PASSWORD || (isProd ? "" : "SurAdmin2026!"));
  await update((data) => {
    if (data.users.length || !email || !password) return;
    data.users.push({
      id: createId(),
      email,
      passwordHash: hashPassword(password),
    });
    console.log(`Administrator ready: ${email}`);
  });
}

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = value;
  }
}
