import type { Prisma } from "@prisma/client";

import { publicCommenterSelect } from "@/lib/public-api/comment-types";
import type { ReviewWithPublicCommenter } from "@/lib/public-api/review-types";
import { prisma } from "@/lib/prisma";
import { decodeCursor, encodeCursor } from "@/lib/utils/pagination";
import { ValidationError } from "@/lib/utils/errors";

const commenterInclude = publicCommenterSelect;

export type ReviewSortMode = "newest" | "oldest" | "highest" | "lowest" | "helpful";

function seekWhereForReviews(
  last: { id: string; createdAt: Date; rating: number; helpfulCount: number },
  sort: ReviewSortMode,
): Prisma.ReviewWhereInput {
  if (sort === "oldest") {
    return {
      OR: [
        { createdAt: { gt: last.createdAt } },
        { AND: [{ createdAt: last.createdAt }, { id: { gt: last.id } }] },
      ],
    };
  }
  if (sort === "highest") {
    return {
      OR: [
        { rating: { lt: last.rating } },
        { AND: [{ rating: last.rating }, { createdAt: { lt: last.createdAt } }] },
        {
          AND: [
            { rating: last.rating },
            { createdAt: last.createdAt },
            { id: { lt: last.id } },
          ],
        },
      ],
    };
  }
  if (sort === "lowest") {
    return {
      OR: [
        { rating: { gt: last.rating } },
        { AND: [{ rating: last.rating }, { createdAt: { gt: last.createdAt } }] },
        {
          AND: [
            { rating: last.rating },
            { createdAt: last.createdAt },
            { id: { gt: last.id } },
          ],
        },
      ],
    };
  }
  if (sort === "helpful") {
    return {
      OR: [
        { helpfulCount: { lt: last.helpfulCount } },
        {
          AND: [{ helpfulCount: last.helpfulCount }, { createdAt: { lt: last.createdAt } }],
        },
        {
          AND: [
            { helpfulCount: last.helpfulCount },
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

export async function listReviewsForPage(options: {
  pageId: string;
  projectId: string;
  sort: ReviewSortMode;
  ratingFilter?: number;
  cursor: string | undefined;
  limit: number;
}): Promise<{
  rows: ReviewWithPublicCommenter[];
  nextCursor: string | undefined;
  hasMore: boolean;
}> {
  const { pageId, projectId, sort, ratingFilter, cursor, limit } = options;

  const orderBy: Prisma.ReviewOrderByWithRelationInput[] =
    sort === "oldest"
      ? [{ createdAt: "asc" }, { id: "asc" }]
      : sort === "highest"
        ? [{ rating: "desc" }, { createdAt: "desc" }, { id: "desc" }]
        : sort === "lowest"
          ? [{ rating: "asc" }, { createdAt: "asc" }, { id: "asc" }]
          : sort === "helpful"
            ? [{ helpfulCount: "desc" }, { createdAt: "desc" }, { id: "desc" }]
            : [{ createdAt: "desc" }, { id: "desc" }];

  const whereBase: Prisma.ReviewWhereInput = {
    pageId,
    projectId,
    status: "approved",
    ...(ratingFilter !== undefined ? { rating: ratingFilter } : {}),
  };

  let where: Prisma.ReviewWhereInput = whereBase;
  if (cursor) {
    const dec = decodeCursor(cursor);
    if (!dec || dec.sort !== sort) {
      throw new ValidationError("Invalid cursor");
    }
    const last = await prisma.review.findFirst({
      where: { id: dec.id, pageId, projectId },
    });
    if (!last) {
      throw new ValidationError("Invalid cursor");
    }
    where = { AND: [whereBase, seekWhereForReviews(last, sort)] };
  }

  const take = limit + 1;
  const rows = await prisma.review.findMany({
    where,
    orderBy,
    take,
    include: { commenter: commenterInclude },
  });

  const hasMore = rows.length > limit;
  const slice = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor =
    hasMore && slice.length > 0
      ? encodeCursor({ id: slice[slice.length - 1].id, sort })
      : undefined;

  return { rows: slice, nextCursor, hasMore };
}
