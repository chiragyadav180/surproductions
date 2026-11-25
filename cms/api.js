let csrfToken = "";

export function setCsrf(token) {
  csrfToken = token || "";
}

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isForm && options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const method = (options.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD" && csrfToken) {
    headers.set("x-csrf-token", csrfToken);
  }
  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "include",
  });
  const type = response.headers.get("content-type") || "";
  if (!type.includes("json")) {
    const error = new Error("The studio API is not available on this deployment.");
    error.status = 503;
    throw error;
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || typeof data !== "object") {
    const error = new Error(data?.error || "Request failed.");
    error.status = response.status;
    throw error;
  }
  return data;
}
