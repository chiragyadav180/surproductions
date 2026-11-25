import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import multer from "multer";
import { createId, normalizeEvent, slugify } from "../shared/event.js";
import { paths, update } from "./store.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
loadEnv(path.join(root, "cms", ".env"));

const PORT = Number(process.env.PORT || 3001);
const SESSION_MS = 1000 * 60 * 60 * 12;
const isProd = process.env.NODE_ENV === "production";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  next();
});

fs.mkdirSync(paths.uploads, { recursive: true });
app.use("/uploads", express.static(paths.uploads, { maxAge: isProd ? "7d" : 0 }));

const attempts = new Map();

await ensureAdmin();

function requireAdmin(req, res, next) {
  const token = readCookie(req, "sur_session");
  const session = findSession(token);
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
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const result = await update((data) => {
    const user = data.users.find((item) => item.email === email);
    if (!user || !verifyPassword(password, user.passwordHash)) return null;
    const session = {
      token: randomBytes(32).toString("hex"),
      csrf: randomBytes(24).toString("hex"),
      userId: user.id,
      email: user.email,
      expiresAt: Date.now() + SESSION_MS,
    };
    data.sessions = data.sessions.filter((item) => item.userId !== user.id).concat(session).slice(-20);
    pushAudit(data, "login", user.email);
    return session;
  });
  if (!result) {
    noteAttempt(ip);
    return res.status(401).json({ error: "Those details do not match an administrator account." });
  }
  clearAttempts(ip);
  setSessionCookie(res, result.token);
  res.json({ email: result.email, csrf: result.csrf });
});

app.post("/api/admin/logout", requireAdmin, async (req, res) => {
  await update((data) => {
    data.sessions = data.sessions.filter((item) => item.token !== req.admin.token);
  });
  res.append(
    "Set-Cookie",
    "sur_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
  );
  res.json({ ok: true });
});

app.get("/api/admin/me", requireAdmin, (req, res) => {
  res.json({ email: req.admin.email, csrf: req.admin.csrf });
});

app.get("/api/admin/overview", requireAdmin, async (req, res) => {
  const data = await update((state) => state);
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
  const data = await update((state) => state);
  const events = [...data.events].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  res.json({ events: events.map(summary) });
});

app.get("/api/admin/events/:id", requireAdmin, async (req, res) => {
  const data = await update((state) => state);
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
  storage: multer.diskStorage({
    destination: paths.uploads,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase();
      const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext) ? ext : ".jpg";
      cb(null, `${Date.now()}-${randomBytes(4).toString("hex")}${safeExt}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Upload a JPG, PNG, WEBP or GIF image."));
  },
});

app.post("/api/admin/media", requireAdmin, (req, res) => {
  upload.single("file")(req, res, (error) => {
    if (error) return res.status(400).json({ error: error.message || "Upload failed." });
    if (!req.file) return res.status(400).json({ error: "Choose an image to upload." });
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

app.get("/api/events", async (req, res) => {
  const data = await update((state) => state);
  const events = data.events
    .filter((item) => item.publicationStatus === "published")
    .sort((a, b) => Number(b.featured) - Number(a.featured) || String(a.startDate).localeCompare(String(b.startDate)));
  res.json({ events });
});

app.get("/api/events/:slug", async (req, res) => {
  if (!/^[a-z0-9-]{1,80}$/.test(req.params.slug)) {
    return res.status(404).json({ error: "Event not found." });
  }
  const data = await update((state) => state);
  const event = data.events.find(
    (item) => item.slug === req.params.slug && item.publicationStatus === "published",
  );
  if (!event) return res.status(404).json({ error: "Event not found." });
  const related = data.events
    .filter((item) => item.publicationStatus === "published" && item.id !== event.id)
    .slice(0, 3);
  res.json({ event, related });
});

if (isProd) {
  const dist = path.join(root, "dist");
  app.use(express.static(dist));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
    res.sendFile(path.join(dist, "index.html"), (error) => (error ? next() : undefined));
  });
}

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  res.status(500).json({ error: "Something went wrong. Try again." });
});

app.listen(PORT, () => {
  console.log(`SUR API listening on http://localhost:${PORT}`);
});

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

function findSession(token) {
  if (!token) return null;
  let found = null;
  const dataPath = paths.store;
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    found = (data.sessions || []).find((item) => item.token === token && item.expiresAt > Date.now()) || null;
  } catch {
    found = null;
  }
  return found;
}

function setSessionCookie(res, token) {
  const secure = isProd ? "; Secure" : "";
  res.append(
    "Set-Cookie",
    `sur_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(SESSION_MS / 1000)}${secure}`,
  );
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
