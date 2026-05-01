import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { findPageByProjectAndUrl } from "@/lib/public-api/page";
import { getEffectiveSettings } from "@/lib/public-api/project-settings";
import { prisma } from "@/lib/prisma";
import { runPublicApi } from "@/lib/public-api/handler";
import {
  normalizeSummaryFromPage,
  recalculatePageRatingSummary,
} from "@/lib/public-api/rating-summary";
import { redis } from "@/lib/redis";
import { normalizeWidgetMode } from "@/lib/widget-mode-ux";
import { ForbiddenError } from "@/lib/utils/errors";
import { ratingSummaryQuerySchema } from "@/lib/validators/review";

const CACHE_TTL_SEC = 300;

export async function GET(request: NextRequest) {
  return runPublicApi(request, async (ctx) => {
    if (normalizeWidgetMode(ctx.project.widgetMode) === "comment") {
      throw new ForbiddenError("Reviews are not enabled for this project");
    }

    const settings = getEffectiveSettings(ctx.project.settings);
    if (!settings.enableRating) {
      throw new ForbiddenError("Ratings are disabled for this project");
    }

    const raw = Object.fromEntries(request.nextUrl.searchParams);
    const q = ratingSummaryQuerySchema.parse(raw);

    const page = await findPageByProjectAndUrl(ctx.project.id, q.page_url);
    const scale = settings.ratingScale;

    if (!page) {
      const empty = normalizeSummaryFromPage(null, scale);
      return NextResponse.json({ success: true, data: empty });
    }

    const cacheKey = `bz:rsum:${page.id}`;
    try {
      const hit = await redis.get(cacheKey);
      if (hit) {
        return new NextResponse(hit, {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch {
      /* continue */
    }

    let summary = normalizeSummaryFromPage(page.ratingSummary, scale);
    if (page.ratingSummary == null) {
      const approved = await prisma.review.count({
        where: { pageId: page.id, status: "approved" },
      });
      if (approved > 0) {
        summary = await recalculatePageRatingSummary(page.id, scale);
      }
    }

    const body = JSON.stringify({ success: true, data: summary });
    try {
      await redis.setex(cacheKey, CACHE_TTL_SEC, body);
    } catch {
      /* ignore */
    }

    return new NextResponse(body, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
}
