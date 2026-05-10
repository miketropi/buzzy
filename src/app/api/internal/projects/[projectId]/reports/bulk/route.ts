import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOwnerId, requireProjectOwned } from "@/lib/internal/project-access";
import { jsonError, jsonSuccess } from "@/lib/utils/response";
import { bulkInternalReportsBodySchema } from "@/lib/validators/internal-reports";

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
    await requireProjectOwned(projectId, ownerId);

    const body = bulkInternalReportsBodySchema.parse(await request.json());

    const result = await prisma.report.updateMany({
      where: {
        id: { in: body.ids },
        OR: [{ comment: { projectId } }, { review: { projectId } }],
      },
      data: { status: body.status },
    });

    return jsonSuccess({ updated: result.count });
  } catch (e) {
    return jsonError(e);
  }
}
