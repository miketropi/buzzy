import { createHash, randomBytes } from "crypto";

/**
 * Cursor-based pagination: opaque base64url payload `{ id: string, sort: string }`.
 * Callers should pass the sort key used for the listing so cursors stay consistent.
 */
export type CursorPayload = {
  id: string;
  sort: string;
};

export function encodeCursor(payload: CursorPayload): string {
  const json = JSON.stringify(payload);
  return Buffer.from(json, "utf8").toString("base64url");
}

export function decodeCursor(cursor: string): CursorPayload | null {
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as unknown;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("id" in parsed) ||
      !("sort" in parsed)
    ) {
      return null;
    }
    const id = (parsed as { id: unknown }).id;
    const sort = (parsed as { sort: unknown }).sort;
    if (typeof id !== "string" || typeof sort !== "string") return null;
    return { id, sort };
  } catch {
    return null;
  }
}

export function clampLimit(raw: number | undefined, fallback: number, max: number): number {
  if (raw === undefined || Number.isNaN(raw)) return fallback;
  return Math.min(Math.max(1, Math.floor(raw)), max);
}

/** Stable hash for cache keys derived from variable-length strings */
export function stableId(input: string): string {
  return createHash("sha256").update(input).digest("base64url").slice(0, 16);
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}
