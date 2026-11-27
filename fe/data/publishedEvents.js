import snapshot from "./published-events.json";

function sortEvents(events) {
  return [...events].sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) ||
      String(a.startDate).localeCompare(String(b.startDate)),
  );
}

export function snapshotEvents() {
  return sortEvents(
    (snapshot.events || []).filter((item) => item.publicationStatus === "published"),
  );
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    const type = response.headers.get("content-type") || "";
    if (!type.includes("json")) return null;
    return { status: response.status, data: await response.json() };
  } finally {
    clearTimeout(timer);
  }
}

/** Live CMS when the API is running. Committed snapshot on static hosts such as Vercel. */
export async function loadPublishedEvents() {
  try {
    const result = await fetchJson("/api/events");
    if (result && Array.isArray(result.data?.events)) return result.data.events;
  } catch {
    /* Static hosting has no events API. */
  }
  return snapshotEvents();
}

export async function loadPublishedEvent(slug) {
  try {
    const result = await fetchJson(`/api/events/${encodeURIComponent(slug)}`);
    if (result?.status === 404) return { missing: true };
    if (result?.data?.event) return result.data;
  } catch {
    /* Static hosting has no events API. */
  }
  const events = snapshotEvents();
  const event = events.find((item) => item.slug === slug);
  if (!event) return { missing: true };
  return {
    event,
    related: events.filter((item) => item.id !== event.id).slice(0, 3),
  };
}
