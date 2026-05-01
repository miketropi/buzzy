import { createHash } from "crypto";

/**
 * Gravatar image URL for an email (MD5 of normalized address).
 * @see https://docs.gravatar.com/api/avatars/images/
 */
export function gravatarUrl(email: string, size = 160): string {
  const normalized = email.trim().toLowerCase();
  const hash = createHash("md5").update(normalized, "utf8").digest("hex");
  const q = new URLSearchParams({ s: String(size), d: "identicon", r: "g" });
  return `https://www.gravatar.com/avatar/${hash}?${q.toString()}`;
}
