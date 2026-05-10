import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOwnerId, requireProjectOwned } from "@/lib/internal/project-access";
import { recalculatePageRatingSummary } from "@/lib/public-api/rating-summary";
import { getEffectiveSettings } from "@/lib/public-api/project-settings";
import { normalizeWidgetMode } from "@/lib/widget-mode-ux";
import { ForbiddenError } from "@/lib/utils/errors";
import { jsonError, jsonSuccess } from "@/lib/utils/response";
import { bulkMessageStatusBodySchema } from "@/lib/validators/internal-messages";

type RouteContext =
  | { params: Promise<{ projectId: string }> }
  | { params: { projectId: string } };

async function getParams(context: RouteContext) {
  const p = context.params;
  return p instanceof Promise ? await p : p;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId } = await getParams(context);
    const project = await requireProjectOwned(projectId, ownerId);
    if (normalizeWidgetMode(project.widgetMode) === "comment") {
      throw new ForbiddenError("Reviews are not enabled for this project");
    }

    const body = bulkMessageStatusBodySchema.parse(await request.json());

    const touched = await prisma.review.findMany({
      where: { projectId, id: { in: body.ids } },
      select: { pageId: true },
    });
    const pageIds = Array.from(new Set(touched.map((r) => r.pageId)));

    const result = await prisma.review.updateMany({
      where: { projectId, id: { in: body.ids } },
      data: { status: body.status },
    });

    const settings = getEffectiveSettings(project.settings);
    const scale = settings.ratingScale;
    for (const pageId of pageIds) {
      await recalculatePageRatingSummary(pageId, scale);
    }

    return jsonSuccess({ updated: result.count });
  } catch (e) {
    return jsonError(e);
  }
}
