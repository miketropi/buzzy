import { prisma } from "@/lib/prisma";
import { stableId } from "@/lib/utils/pagination";

const MAX_PAGE_ID_LEN = 2048;

/**
 * Canonical stored value for a "page": full http(s) URLs are normalized via URL;
 * paths, slugs, and opaque ids are trimmed and capped in length (no URL parsing).
 */
export function normalizePageIdentifier(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  const capped = t.length > MAX_PAGE_ID_LEN ? t.slice(0, MAX_PAGE_ID_LEN) : t;
  if (/^https?:\/\//i.test(capped)) {
    try {
      return new URL(capped).href.slice(0, MAX_PAGE_ID_LEN);
    } catch {
      return capped;
    }
  }
  return capped;
}

/** @deprecated Use normalizePageIdentifier — alias for compatibility. */
export function normalizePageUrl(raw: string): string {
  return normalizePageIdentifier(raw);
}

export function slugFromPageIdentifier(raw: string): string {
  const n = normalizePageIdentifier(raw);
  if (!n) throw new Error("page identifier is empty");
  return stableId(n);
}

/** @deprecated Use slugFromPageIdentifier — alias for compatibility. */
export function slugFromPageUrl(raw: string): string {
  return slugFromPageIdentifier(raw);
}

export async function findPageByProjectAndUrl(projectId: string, pageKey: string) {
  const slug = slugFromPageIdentifier(pageKey);
  return prisma.page.findUnique({
    where: { projectId_slug: { projectId, slug } },
  });
}

export async function findOrCreatePage(projectId: string, pageKey: string, title?: string | null) {
  const url = normalizePageIdentifier(pageKey);
  if (!url) {
    throw new Error("page identifier is empty");
  }
  const slug = stableId(url);
  const existing = await prisma.page.findUnique({
    where: { projectId_slug: { projectId, slug } },
  });
  if (existing) {
    if (title && title !== existing.title) {
      return prisma.page.update({
        where: { id: existing.id },
        data: { title, url },
      });
    }
    return existing;
  }
  return prisma.page.create({
    data: {
      projectId,
      url,
      slug,
      title: title ?? null,
    },
  });
}
