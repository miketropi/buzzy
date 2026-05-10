import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOwnerId, requireProjectOwned } from "@/lib/internal/project-access";
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
    if (normalizeWidgetMode(project.widgetMode) === "review") {
      throw new ForbiddenError("Comments are not enabled for this project");
    }

    const body = bulkMessageStatusBodySchema.parse(await request.json());

    const result = await prisma.comment.updateMany({
      where: { projectId, id: { in: body.ids } },
      data: { status: body.status },
    });

    return jsonSuccess({ updated: result.count });
  } catch (e) {
    return jsonError(e);
  }
}
