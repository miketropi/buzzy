import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";

import { BUZZY_HOST_IDENTITY_HEADER } from "@/lib/public-api/buzzy-host-identity-header";

/** Public API header: HMAC-signed JSON identity from the host backend (not the dashboard user session). */
export { BUZZY_HOST_IDENTITY_HEADER };

export const HOST_SSO_PROVIDER = "host_sso";

const MAX_SUB_LEN = 200;
const MAX_NAME_LEN = 120;
const MAX_EMAIL_LEN = 200;
const MAX_AVATAR_URL_LEN = 2048;
const MAX_USERNAME_LEN = 80;

/** Max token age (exp - iat or exp - now). */
const MAX_TOKEN_AGE_SEC = 15 * 60;

export type HostSsoClaims = {
  sub: string;
  name: string;
  email?: string;
  avatar?: string | null;
  username?: string;
};

type RawPayload = {
  sub?: unknown;
  name?: unknown;
  email?: unknown;
  /** OIDC-style alias used by some IdPs */
  mail?: unknown;
  avatar?: unknown;
  /** OIDC / Google-style profile image */
  picture?: unknown;
  username?: unknown;
  pid?: unknown;
  exp?: unknown;
  iat?: unknown;
};

function signPayload(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

function isHttpsUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "https:" && u.hostname.length > 0;
  } catch {
    return false;
  }
}

function normalizeAvatar(url: unknown): string | null {
  if (url == null || url === "") return null;
  if (typeof url !== "string") return null;
  const t = url.trim();
  if (!t || t.length > MAX_AVATAR_URL_LEN) return null;
  if (!isHttpsUrl(t)) return null;
  return t;
}

/**
 * Email from a signed Host SSO payload — use Zod’s parser (stricter than a single regex, matches other public API paths).
 */
function normalizeSignedSsoEmail(raw: unknown): string | null {
  if (raw == null || raw === "") return null;
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t || t.length > MAX_EMAIL_LEN) return null;
  return z.string().email().safeParse(t).success ? t : null;
}

/**
 * Verifies Host SSO assertion. Email and avatar are taken from the signed payload when valid.
 * Accepts `mail` / `picture` as aliases for `email` / `avatar` (common IdP / OIDC fields).
 */
export function verifyHostSsoAssertion(
  token: string | null | undefined,
  expectedProjectId: string,
  secret: string | null | undefined,
): HostSsoClaims | null {
  if (!token?.trim() || !secret?.trim()) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const payloadPart = token.slice(0, dot);
  const sigPart = token.slice(dot + 1);
  const expectedSig = signPayload(payloadPart, secret);
  try {
    if (
      sigPart.length !== expectedSig.length ||
      !timingSafeEqual(Buffer.from(sigPart), Buffer.from(expectedSig))
    ) {
      return null;
    }
  } catch {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) return null;
  const p = parsed as RawPayload;

  if (typeof p.sub !== "string" || typeof p.name !== "string") return null;
  if (typeof p.exp !== "number" || !Number.isFinite(p.exp)) return null;
  if (typeof p.pid !== "string" || p.pid !== expectedProjectId) return null;

  const sub = p.sub.trim();
  const name = p.name.trim();
  if (!sub || sub.length > MAX_SUB_LEN) return null;
  if (!name || name.length > MAX_NAME_LEN) return null;

  const now = Math.floor(Date.now() / 1000);
  if (p.exp <= now) return null;
  if (p.exp - now > MAX_TOKEN_AGE_SEC) return null;
  if (typeof p.iat === "number" && Number.isFinite(p.iat)) {
    if (p.exp - p.iat > MAX_TOKEN_AGE_SEC) return null;
    if (p.iat > now + 60) return null;
  }

  let username: string | undefined;
  if (p.username != null && p.username !== "") {
    if (typeof p.username !== "string") return null;
    const u = p.username.trim();
    if (u.length > MAX_USERNAME_LEN) return null;
    username = u;
  }

  const rawEmail = p.email ?? p.mail;
  const rawAvatar = p.avatar ?? p.picture;

  return {
    sub,
    name,
    email: normalizeSignedSsoEmail(rawEmail) ?? undefined,
    avatar: normalizeAvatar(rawAvatar),
    username,
  };
}
