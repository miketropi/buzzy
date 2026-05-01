import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  type CommentWithPublicCommenter,
  publicCommenterSelect,
} from "@/lib/public-api/comment-types";
import { decodeCursor, encodeCursor } from "@/lib/utils/pagination";
import { ValidationError } from "@/lib/utils/errors";

const commenterInclude = publicCommenterSelect;

export type SortMode = "newest" | "oldest" | "popular";

function seekWhereForRoots(
  last: { id: string; createdAt: Date; upvotes: number },
  sort: SortMode,
): Prisma.CommentWhereInput {
  if (sort === "oldest") {
    return {
      OR: [
        { createdAt: { gt: last.createdAt } },
        { AND: [{ createdAt: last.createdAt }, { id: { gt: last.id } }] },
      ],
    };
  }
  if (sort === "popular") {
    return {
      OR: [
        { upvotes: { lt: last.upvotes } },
        {
          AND: [
            { upvotes: last.upvotes },
            { createdAt: { lt: last.createdAt } },
          ],
        },
        {
          AND: [
            { upvotes: last.upvotes },
            { createdAt: last.createdAt },
            { id: { lt: last.id } },
          ],
        },
      ],
    };
  }
  return {
    OR: [
      { createdAt: { lt: last.createdAt } },
      { AND: [{ createdAt: last.createdAt }, { id: { lt: last.id } }] },
    ],
  };
}

export async function listCommentsForPage(options: {
  pageId: string;
  sort: SortMode;
  cursor: string | undefined;
  limit: number;
}): Promise<{
  roots: CommentWithPublicCommenter[];
  flatReplies: CommentWithPublicCommenter[];
  nextCursor: string | undefined;
  hasMore: boolean;
}> {
  const { pageId, sort, cursor, limit } = options;

  const orderBy: Prisma.CommentOrderByWithRelationInput[] =
    sort === "oldest"
      ? [{ createdAt: "asc" }, { id: "asc" }]
      : sort === "popular"
        ? [{ upvotes: "desc" }, { createdAt: "desc" }, { id: "desc" }]
        : [{ createdAt: "desc" }, { id: "desc" }];

  const whereBase: Prisma.CommentWhereInput = {
    pageId,
    parentId: null,
    status: "approved",
  };

  let where: Prisma.CommentWhereInput = whereBase;
  if (cursor) {
    const dec = decodeCursor(cursor);
    if (!dec || dec.sort !== sort) {
      throw new ValidationError("Invalid cursor");
    }
    const last = await prisma.comment.findFirst({
      where: { id: dec.id, pageId, parentId: null },
    });
    if (!last) {
      throw new ValidationError("Invalid cursor");
    }
    where = { AND: [whereBase, seekWhereForRoots(last, sort)] };
  }

  const take = limit + 1;
  const rows = await prisma.comment.findMany({
    where,
    orderBy,
    take,
    include: { commenter: commenterInclude },
  });

  const hasMore = rows.length > limit;
  const roots = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor =
    hasMore && roots.length > 0
      ? encodeCursor({ id: roots[roots.length - 1].id, sort })
      : undefined;

  const rootIds = roots.map((r) => r.id);
  const flatReplies = await fetchDescendants(pageId, rootIds);

  return { roots, flatReplies: flatReplies, nextCursor, hasMore };
}

async function fetchDescendants(
  pageId: string,
  seed: string[],
): Promise<CommentWithPublicCommenter[]> {
  let frontier = [...seed];
  const collected: CommentWithPublicCommenter[] = [];
  while (frontier.length > 0) {
    const batch = await prisma.comment.findMany({
      where: { pageId, parentId: { in: frontier }, status: "approved" },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      include: { commenter: commenterInclude },
    });
    frontier = batch.map((b) => b.id);
    collected.push(...batch);
  }
  return collected;
}
