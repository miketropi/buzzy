import { BUZZY_HOST_IDENTITY_HEADER } from "../lib/public-api/buzzy-host-identity-header";
import { setEmbedProfile } from "./embed-profile";

let token: string | null = null;

export const BUZZY_HOST_IDENTITY_EVENT = "buzzy:host-identity";

function isHttpsUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "https:" && u.hostname.length > 0;
  } catch {
    return false;
  }
}

function base64UrlPayloadToUtf8(b64url: string): string | null {
  try {
    let s = b64url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = s.length % 4;
    if (pad) s += "=".repeat(4 - pad);
    const bin = atob(s);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i) & 0xff;
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Read name / email / avatar from the unsigned JWT-style payload (first segment).
 * For UI only — the API still verifies signature + exp on the full token.
 */
export function decodeHostIdentityPayloadForDisplay(
  raw: string | null | undefined,
): { name?: string; email?: string; avatarUrl?: string } | null {
  if (!raw?.trim()) return null;
  const dot = raw.indexOf(".");
  if (dot < 0) return null;
  const payloadPart = raw.slice(0, dot);
  const txt = base64UrlPayloadToUtf8(payloadPart);
  if (!txt) return null;
  let obj: unknown;
  try {
    obj = JSON.parse(txt);
  } catch {
    return null;
  }
  if (typeof obj !== "object" || obj === null) return null;
  const p = obj as Record<string, unknown>;
  const name = typeof p.name === "string" ? p.name.trim() : "";
  const email =
    typeof p.email === "string"
      ? p.email.trim()
      : typeof p.mail === "string"
        ? p.mail.trim()
        : "";
  let avatarUrl: string | undefined;
  if (typeof p.avatar === "string") {
    const a = p.avatar.trim();
    if (a.length > 0 && a.length <= 2048 && isHttpsUrl(a)) avatarUrl = a;
  }
  if (!avatarUrl && typeof p.picture === "string") {
    const a = p.picture.trim();
    if (a.length > 0 && a.length <= 2048 && isHttpsUrl(a)) avatarUrl = a;
  }
  if (!name && !email && !avatarUrl) return null;
  const out: { name?: string; email?: string; avatarUrl?: string } = {};
  if (name) out.name = name;
  if (email) out.email = email;
  if (avatarUrl) out.avatarUrl = avatarUrl;
  return out;
}

function mergeProfileFieldsFromHostIdentityToken(raw: string | null) {
  const d = decodeHostIdentityPayloadForDisplay(raw);
  if (!d) return;
  const patch: { name?: string; email?: string; avatarUrl?: string } = {};
  if (d.name) patch.name = d.name;
  if (d.email) patch.email = d.email;
  if (d.avatarUrl) patch.avatarUrl = d.avatarUrl;
  if (Object.keys(patch).length > 0) setEmbedProfile(patch);
}

function dispatchHostIdentityChanged() {
  if (typeof globalThis.dispatchEvent === "function") {
    globalThis.dispatchEvent(new Event(BUZZY_HOST_IDENTITY_EVENT));
  }
}

export function getHostIdentityPresent(): boolean {
  return Boolean(token?.trim());
}

export function setHostIdentityToken(next: string | null) {
  token = next?.trim() || null;
  if (token) mergeProfileFieldsFromHostIdentityToken(token);
  dispatchHostIdentityChanged();
}

export function hostIdentityHeaders(): Record<string, string> {
  return token ? { [BUZZY_HOST_IDENTITY_HEADER]: token } : {};
}
