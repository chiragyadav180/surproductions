export const EVENT_STATUSES = [
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "postponed", label: "Postponed" },
  { value: "cancelled", label: "Cancelled" },
];

export const PUBLICATION_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export const DATE_STATUSES = [
  { value: "unset", label: "Not set" },
  { value: "tentative", label: "Tentative" },
  { value: "confirmed", label: "Confirmed" },
];

export const CONFIRMATIONS = [
  { value: "proposed", label: "Proposed" },
  { value: "awaiting", label: "Awaiting confirmation" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

export const SCHEDULE_STATUSES = [
  { value: "indicative", label: "Indicative" },
  { value: "final", label: "Final" },
];

export const REGISTRATION_STATUSES = [
  { value: "hidden", label: "No public registration" },
  { value: "coming-soon", label: "Coming soon" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
];

export const PAGE_BLOCKS = [
  { key: "story", label: "Sections" },
  { key: "highlights", label: "Highlights" },
  { key: "speakers", label: "Speakers and guests" },
  { key: "agenda", label: "Agenda" },
  { key: "zones", label: "Experience zones" },
  { key: "audience", label: "Audience" },
  { key: "benefits", label: "Benefits and outcomes" },
  { key: "media", label: "Media and communications" },
  { key: "gallery", label: "Gallery" },
  { key: "cta", label: "Registration and enquiry" },
];

export function createId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function labelFor(list, value) {
  return list.find((item) => item.value === value)?.label || "";
}

function text(value, max) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function block(value, max) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);
}

export function safeUrl(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (raw.startsWith("/uploads/") && !raw.includes("..")) return raw.slice(0, 240);
  if (/^https?:\/\//i.test(raw)) return raw.slice(0, 400);
  return "";
}

function keepId(value) {
  const id = String(value ?? "");
  return /^[a-zA-Z0-9-]{8,80}$/.test(id) ? id : createId();
}

function oneOf(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function listOf(value, max, mapItem) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, max).map((item, index) => mapItem(item || {}, index));
}

export function blankSection() {
  return {
    id: createId(),
    heading: "",
    subtitle: "",
    body: "",
    image: "",
    imageAlt: "",
    icon: "",
    visible: true,
  };
}

export function blankHighlight() {
  return { id: createId(), title: "", description: "", image: "" };
}

export function blankSpeaker() {
  return {
    id: createId(),
    name: "",
    designation: "",
    bio: "",
    photo: "",
    sessionTitle: "",
    category: "",
    confirmation: "proposed",
  };
}

export function blankSession() {
  return {
    id: createId(),
    title: "",
    category: "",
    description: "",
    startTime: "",
    endTime: "",
    stage: "",
    speakers: "",
    confirmation: "proposed",
  };
}

export function blankZone() {
  return { id: createId(), title: "", description: "", image: "", category: "" };
}

export function blankAudience() {
  return { id: createId(), label: "" };
}

export function blankBenefit() {
  return { id: createId(), title: "", description: "" };
}

export function blankGalleryItem() {
  return { id: createId(), url: "", alt: "", caption: "", credit: "" };
}

export function blankSocial() {
  return { id: createId(), label: "", url: "" };
}

export function blankEvent() {
  return {
    id: "",
    title: "",
    subtitle: "",
    slug: "",
    category: "",
    shortDescription: "",
    description: "",
    tagline: "",
    eventStatus: "upcoming",
    publicationStatus: "draft",
    featured: false,
    homepage: false,
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    dateStatus: "unset",
    tentativeDateText: "",
    timezone: "",
    venue: "",
    city: "",
    state: "",
    country: "",
    address: "",
    mapsUrl: "",
    heroImage: "",
    heroAlt: "",
    coverImage: "",
    thumbnail: "",
    videoUrl: "",
    gallery: [],
    sections: [],
    highlights: [],
    speakers: [],
    sessions: [],
    scheduleStatus: "indicative",
    scheduleNote: "",
    zones: [],
    audiences: [],
    benefits: [],
    registrationUrl: "",
    ticketUrl: "",
    enquiryUrl: "",
    ctaText: "",
    ctaVisible: false,
    registrationStatus: "hidden",
    media: {
      before: "",
      during: "",
      after: "",
      coverage: "",
      press: "",
      social: [],
    },
    pageBlocks: PAGE_BLOCKS.map((item) => ({ key: item.key, visible: true })),
  };
}

export function normalizeBlocks(input) {
  const incoming = Array.isArray(input) ? input : [];
  const seen = new Set();
  const ordered = [];
  for (const item of incoming) {
    const key = item?.key;
    if (!PAGE_BLOCKS.some((block) => block.key === key) || seen.has(key)) continue;
    seen.add(key);
    ordered.push({ key, visible: item.visible !== false });
  }
  for (const block of PAGE_BLOCKS) {
    if (!seen.has(block.key)) ordered.push({ key: block.key, visible: true });
  }
  return ordered;
}

export function normalizeEvent(input) {
  const source = input && typeof input === "object" ? input : {};
  const title = text(source.title, 180);
  if (!title) return { error: "Add an event title." };

  const event = {
    title,
    subtitle: text(source.subtitle, 240),
    slug: slugify(source.slug || title),
    category: text(source.category, 80),
    shortDescription: block(source.shortDescription, 400),
    description: block(source.description, 6000),
    tagline: text(source.tagline, 220),
    eventStatus: oneOf(
      source.eventStatus,
      EVENT_STATUSES.map((item) => item.value),
      "upcoming",
    ),
    publicationStatus: oneOf(
      source.publicationStatus,
      PUBLICATION_STATUSES.map((item) => item.value),
      "draft",
    ),
    featured: Boolean(source.featured),
    homepage: Boolean(source.homepage),
    startDate: /^\d{4}-\d{2}-\d{2}$/.test(source.startDate || "") ? source.startDate : "",
    endDate: /^\d{4}-\d{2}-\d{2}$/.test(source.endDate || "") ? source.endDate : "",
    startTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(source.startTime || "") ? source.startTime : "",
    endTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(source.endTime || "") ? source.endTime : "",
    dateStatus: oneOf(
      source.dateStatus,
      DATE_STATUSES.map((item) => item.value),
      "unset",
    ),
    tentativeDateText: text(source.tentativeDateText, 160),
    timezone: text(source.timezone, 80),
    venue: text(source.venue, 180),
    city: text(source.city, 80),
    state: text(source.state, 80),
    country: text(source.country, 80),
    address: block(source.address, 300),
    mapsUrl: safeUrl(source.mapsUrl),
    heroImage: safeUrl(source.heroImage),
    heroAlt: text(source.heroAlt, 180),
    coverImage: safeUrl(source.coverImage),
    thumbnail: safeUrl(source.thumbnail),
    videoUrl: safeUrl(source.videoUrl),
    gallery: listOf(source.gallery, 24, (item) => ({
      id: keepId(item.id),
      url: safeUrl(item.url),
      alt: text(item.alt, 180),
      caption: text(item.caption, 180),
      credit: text(item.credit, 120),
    })).filter((item) => item.url),
    sections: listOf(source.sections, 30, (item) => ({
      id: keepId(item.id),
      heading: text(item.heading, 160),
      subtitle: text(item.subtitle, 200),
      body: block(item.body, 4000),
      image: safeUrl(item.image),
      imageAlt: text(item.imageAlt, 180),
      icon: text(item.icon, 40),
      visible: item.visible !== false,
    })),
    highlights: listOf(source.highlights, 24, (item) => ({
      id: keepId(item.id),
      title: text(item.title, 120),
      description: block(item.description, 600),
      image: safeUrl(item.image),
    })),
    speakers: listOf(source.speakers, 40, (item) => ({
      id: keepId(item.id),
      name: text(item.name, 120),
      designation: text(item.designation, 160),
      bio: block(item.bio, 1200),
      photo: safeUrl(item.photo),
      sessionTitle: text(item.sessionTitle, 160),
      category: text(item.category, 80),
      confirmation: oneOf(
        item.confirmation,
        CONFIRMATIONS.map((entry) => entry.value),
        "proposed",
      ),
    })),
    sessions: listOf(source.sessions, 40, (item) => ({
      id: keepId(item.id),
      title: text(item.title, 160),
      category: text(item.category, 80),
      description: block(item.description, 800),
      startTime: text(item.startTime, 40),
      endTime: text(item.endTime, 40),
      stage: text(item.stage, 80),
      speakers: text(item.speakers, 200),
      confirmation: oneOf(
        item.confirmation,
        CONFIRMATIONS.map((entry) => entry.value),
        "proposed",
      ),
    })),
    scheduleStatus: oneOf(
      source.scheduleStatus,
      SCHEDULE_STATUSES.map((item) => item.value),
      "indicative",
    ),
    scheduleNote: text(source.scheduleNote, 240),
    zones: listOf(source.zones, 24, (item) => ({
      id: keepId(item.id),
      title: text(item.title, 120),
      description: block(item.description, 600),
      image: safeUrl(item.image),
      category: text(item.category, 80),
    })),
    audiences: listOf(source.audiences, 24, (item) => ({
      id: keepId(item.id),
      label: text(item.label, 80),
    })).filter((item) => item.label),
    benefits: listOf(source.benefits, 16, (item) => ({
      id: keepId(item.id),
      title: text(item.title, 120),
      description: block(item.description, 500),
    })),
    registrationUrl: safeUrl(source.registrationUrl),
    ticketUrl: safeUrl(source.ticketUrl),
    enquiryUrl: safeUrl(source.enquiryUrl),
    ctaText: text(source.ctaText, 80),
    ctaVisible: Boolean(source.ctaVisible),
    registrationStatus: oneOf(
      source.registrationStatus,
      REGISTRATION_STATUSES.map((item) => item.value),
      "hidden",
    ),
    media: {
      before: block(source.media?.before, 800),
      during: block(source.media?.during, 800),
      after: block(source.media?.after, 800),
      coverage: block(source.media?.coverage, 800),
      press: block(source.media?.press, 800),
      social: listOf(source.media?.social, 8, (item) => ({
        id: keepId(item.id),
        label: text(item.label, 40),
        url: safeUrl(item.url),
      })).filter((item) => item.url),
    },
    pageBlocks: normalizeBlocks(source.pageBlocks),
  };

  if (!event.slug) return { error: "Add a title that can become a page address." };
  return { event };
}

export function blockHasContent(event, key) {
  switch (key) {
    case "story":
      return (event.sections || []).some(
        (item) => item.visible !== false && (item.heading || item.body || item.image),
      );
    case "highlights":
      return (event.highlights || []).some((item) => item.title || item.description);
    case "speakers":
      return (event.speakers || []).some((item) => item.name);
    case "agenda":
      return (event.sessions || []).some((item) => item.title);
    case "zones":
      return (event.zones || []).some((item) => item.title || item.description);
    case "audience":
      return (event.audiences || []).some((item) => item.label);
    case "benefits":
      return (event.benefits || []).some((item) => item.title || item.description);
    case "media":
      return Boolean(
        event.media?.before ||
          event.media?.during ||
          event.media?.after ||
          event.media?.coverage ||
          event.media?.press ||
          (event.media?.social || []).length,
      );
    case "gallery":
      return (event.gallery || []).some((item) => item.url);
    case "cta":
      return Boolean(
        event.ctaVisible &&
          (event.ctaText || event.registrationUrl || event.ticketUrl || event.enquiryUrl),
      );
    default:
      return false;
  }
}

export function visiblePageBlocks(event) {
  return (event.pageBlocks || [])
    .filter((block) => block.visible !== false && blockHasContent(event, block.key));
}

function formatIsoDate(iso) {
  const [year, month, day] = String(iso || "").split("-").map(Number);
  if (!year || !month || !day) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatEventWhen(event) {
  if (event.dateStatus === "tentative") {
    return event.tentativeDateText || "Date to be confirmed";
  }
  if (event.dateStatus !== "confirmed" || !event.startDate) return "";
  const start = formatIsoDate(event.startDate);
  if (event.endDate && event.endDate !== event.startDate) {
    return `${start} – ${formatIsoDate(event.endDate)}`;
  }
  return start;
}

export function formatEventTime(event) {
  if (!event.startTime && !event.endTime) return "";
  const range =
    event.startTime && event.endTime
      ? `${event.startTime} – ${event.endTime}`
      : event.startTime || event.endTime;
  return event.timezone ? `${range} ${event.timezone}` : range;
}

export function formatEventPlace(event) {
  const locality = [event.city, event.state, event.country].filter(Boolean).join(", ");
  return [event.venue, locality].filter(Boolean);
}

export function eventImage(event) {
  return event.thumbnail || event.coverImage || event.heroImage || "";
}

export function moveItem(list, index, direction) {
  const next = [...list];
  const target = index + direction;
  if (target < 0 || target >= next.length) return next;
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}
