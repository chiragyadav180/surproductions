export const site = {
  name: "SUR Productions",
  description:
    "SUR Productions creates films, documentaries, events, digital work and communications. Stories, experiences and communication that make an impact.",
  /**
   * Set VITE_SITE_URL to the live origin, with no trailing slash,
   * once the production domain is confirmed. Canonical and social
   * URLs stay off until then so a domain is never invented.
   */
  url: (import.meta.env.VITE_SITE_URL || "").replace(/\/$/, ""),
  /**
   * Set VITE_CONTACT_ENDPOINT to an HTTPS URL that accepts POST JSON:
   * { name, email, phone, organisation, service, message }
   * Leave it empty until that endpoint exists.
   */
  contactEndpoint: import.meta.env.VITE_CONTACT_ENDPOINT || "",
};

export function absoluteUrl(path = "/") {
  if (!site.url) return "";
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
