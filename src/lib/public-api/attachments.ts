import type { Prisma } from "@prisma/client";

import { ValidationError } from "@/lib/utils/errors";
import type { AttachmentPayloadItem } from "@/lib/validators/attachment";

export type PublicAttachment = AttachmentPayloadItem;

function r2PublicBase(): string | null {
  const b = process.env.R2_PUBLIC_URL?.trim();
  return b ? b.replace(/\/$/, "") : null;
}

/** Ensure client only submits URLs served from this deployment’s R2 public base. */
export function assertAttachmentsFromR2(items: AttachmentPayloadItem[]): void {
  const base = r2PublicBase();
  if (!base || items.length === 0) return;
  const prefix = `${base}/`;
  for (const a of items) {
    const u = a.url.trim();
    if (!u.startsWith(prefix)) {
      throw new ValidationError("Invalid attachment URL");
    }
  }
}

/** Safe parse for JSON stored in DB → API. Drops invalid entries. */
export function attachmentsFromDb(value: Prisma.JsonValue | null | undefined): PublicAttachment[] {
  if (value == null) return [];
  if (!Array.isArray(value)) return [];
  const out: PublicAttachment[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const o = raw as Record<string, unknown>;
    const kind = o.kind;
    const url = o.url;
    if (kind !== "image" && kind !== "video" && kind !== "document") continue;
    if (typeof url !== "string" || url.length > 2048) continue;
    try {
      const u = new URL(url);
      if (u.protocol !== "https:" && u.protocol !== "http:") continue;
    } catch {
      continue;
    }
    const filename = typeof o.filename === "string" ? o.filename.slice(0, 240) : undefined;
    const content_type = typeof o.content_type === "string" ? o.content_type.slice(0, 120) : undefined;
    out.push({ kind, url, filename, content_type });
  }
  return out;
}

export function attachmentsSpamProbe(items: PublicAttachment[]): string {
  return items.map((a) => `${a.filename ?? ""}\t${a.url}`).join("\n");
}
