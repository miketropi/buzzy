import { hostIdentityHeaders } from "./embed-host-identity";

export function normalizeApiBase(url: string): string {
  if (!url || typeof url !== "string") return "";
  let u = url.trim().replace(/\/$/, "");
  if (u.endsWith("/api/v1")) u = u.slice(0, -7).replace(/\/$/, "");
  return u;
}

export function fetchJson(url: string, options?: { method?: string; headers?: Record<string, string>; body?: unknown }) {
  const opts = options || {};
  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body) headers["Content-Type"] = "application/json";
  Object.assign(headers, opts.headers || {}, hostIdentityHeaders());
  return fetch(url, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: "omit",
  }).then((res) =>
    res.text().then((text) => {
      let json: { success?: boolean; error?: { message?: string }; data?: unknown };
      try {
        json = text ? (JSON.parse(text) as typeof json) : {};
      } catch {
        throw new Error("Invalid JSON from API");
      }
      if (!json.success) {
        const msg = (json.error && json.error.message) || res.statusText || "Request failed";
        throw new Error(msg);
      }
      return json;
    }),
  );
}
