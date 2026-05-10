import type { Prisma } from "@prisma/client";

export function inboxSearchTrimmed(q: string | undefined | null): string | undefined {
  const t = typeof q === "string" ? q.trim() : "";
  return t.length > 0 ? t.slice(0, 160) : undefined;
}

export function commentInboxWhere(
  projectId: string,
  status: string | undefined,
  search: string | undefined,
): Prisma.CommentWhereInput {
  const where: Prisma.CommentWhereInput = { projectId };
  if (status && status !== "all") {
    where.status = status;
  }
  const s = search;
  if (s) {
    where.OR = [
      { content: { contains: s } },
      { htmlContent: { contains: s } },
      { page: { title: { contains: s } } },
      { page: { url: { contains: s } } },
      { commenter: { name: { contains: s } } },
      { commenter: { email: { contains: s } } },
    ];
  }
  return where;
}

export function reviewInboxWhere(
  projectId: string,
  status: string | undefined,
  search: string | undefined,
): Prisma.ReviewWhereInput {
  const where: Prisma.ReviewWhereInput = { projectId };
  if (status && status !== "all") {
    where.status = status;
  }
  const s = search;
  if (s) {
    where.OR = [
      { title: { contains: s } },
      { content: { contains: s } },
      { htmlContent: { contains: s } },
      { page: { title: { contains: s } } },
      { page: { url: { contains: s } } },
      { commenter: { name: { contains: s } } },
      { commenter: { email: { contains: s } } },
    ];
  }
  return where;
}
