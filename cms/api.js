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
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Request failed.");
    error.status = response.status;
    throw error;
  }
  return data;
}
