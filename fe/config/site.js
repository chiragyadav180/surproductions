import { SITE_ORIGIN } from "../../cms/shared/siteOrigin.js";

export const site = {
  name: "SUR Productions",
  description:
    "SUR Productions creates films, documentaries, events, digital work and communications. Stories, experiences and communication that make an impact.",
  /**
   * Production builds use https://surproductions.com.
   * VITE_SITE_URL can override it. Local dev leaves canonical URLs off.
   */
  url: (import.meta.env.VITE_SITE_URL || (import.meta.env.PROD ? SITE_ORIGIN : "")).replace(/\/$/, ""),
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
