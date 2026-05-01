import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export type PageRatingSummaryJson = {
  averageRating: number;
  totalReviews: number;
  distribution: Record<string, number>;
  categoryAverages: Record<string, number>;
};

function emptyDistribution(ratingScale: number): Record<string, number> {
  const d: Record<string, number> = {};
  for (let i = 1; i <= ratingScale; i++) {
    d[String(i)] = 0;
  }
  return d;
}

export async function recalculatePageRatingSummary(
  pageId: string,
  ratingScale: number,
): Promise<PageRatingSummaryJson> {
  const reviews = await prisma.review.findMany({
    where: { pageId, status: "approved" },
    select: { rating: true, categoryRatings: true },
  });

  const distribution = emptyDistribution(ratingScale);
  let sum = 0;
  const categoryAgg: Record<string, { sum: number; count: number }> = {};

  for (const r of reviews) {
    sum += r.rating;
    const rk = String(r.rating);
    distribution[rk] = (distribution[rk] ?? 0) + 1;

    const cr = r.categoryRatings;
    if (cr && typeof cr === "object" && !Array.isArray(cr)) {
      for (const [ck, cv] of Object.entries(cr as Record<string, unknown>)) {
        if (typeof cv !== "number") continue;
        if (!categoryAgg[ck]) {
          categoryAgg[ck] = { sum: 0, count: 0 };
        }
        categoryAgg[ck].sum += cv;
        categoryAgg[ck].count += 1;
      }
    }
  }

  const n = reviews.length;
  const categoryAverages: Record<string, number> = {};
  for (const [ck, v] of Object.entries(categoryAgg)) {
    categoryAverages[ck] = Math.round((v.sum / v.count) * 10) / 10;
  }

  const summary: PageRatingSummaryJson = {
    averageRating: n === 0 ? 0 : Math.round((sum / n) * 10) / 10,
    totalReviews: n,
    distribution,
    categoryAverages,
  };

  await prisma.page.update({
    where: { id: pageId },
    data: { ratingSummary: summary as unknown as Prisma.InputJsonValue },
  });

  await redis.del(`bz:rsum:${pageId}`).catch(() => {});

  return summary;
}

export function normalizeSummaryFromPage(
  raw: Prisma.JsonValue | null | undefined,
  ratingScale: number,
): PageRatingSummaryJson {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    const dist =
      typeof o.distribution === "object" &&
      o.distribution !== null &&
      !Array.isArray(o.distribution)
        ? { ...emptyDistribution(ratingScale), ...(o.distribution as Record<string, number>) }
        : emptyDistribution(ratingScale);
    const cats =
      typeof o.categoryAverages === "object" &&
      o.categoryAverages !== null &&
      !Array.isArray(o.categoryAverages)
        ? (o.categoryAverages as Record<string, number>)
        : {};
    return {
      averageRating: typeof o.averageRating === "number" ? o.averageRating : 0,
      totalReviews: typeof o.totalReviews === "number" ? o.totalReviews : 0,
      distribution: dist,
      categoryAverages: cats,
    };
  }
  return {
    averageRating: 0,
    totalReviews: 0,
    distribution: emptyDistribution(ratingScale),
    categoryAverages: {},
  };
}
