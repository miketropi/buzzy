/**
 * Strip to a display-safe avatar URL. Only HTTPS (matches server `normalizeAvatar`).
 */
export function trustedCommenterAvatarUrl(raw: unknown): string | null {
  if (raw == null || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t) return null;
  try {
    const u = new URL(t);
    return u.protocol === "https:" && u.hostname.length > 0 ? t : null;
  } catch {
    return null;
  }
}
