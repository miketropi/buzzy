import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOwnerId, requireProjectOwned, isUuid } from "@/lib/internal/project-access";
import { writeModerationAuditLog } from "@/lib/internal/moderation-audit";
import { NotFoundError } from "@/lib/utils/errors";
import { jsonError, jsonSuccess } from "@/lib/utils/response";
import { patchInternalReportBodySchema } from "@/lib/validators/internal-reports";

type RouteContext =
  | { params: Promise<{ projectId: string; reportId: string }> }
  | { params: { projectId: string; reportId: string } };

async function getParams(context: RouteContext) {
  const p = context.params;
  return p instanceof Promise ? await p : p;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId, reportId } = await getParams(context);
    await requireProjectOwned(projectId, ownerId);
    if (!isUuid(reportId)) {
      throw new NotFoundError("Report not found");
    }

    const patch = patchInternalReportBodySchema.parse(await request.json());

    const existing = await prisma.report.findFirst({
      where: {
        id: reportId,
        OR: [{ comment: { projectId } }, { review: { projectId } }],
      },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundError("Report not found");
    }

    await prisma.report.update({
      where: { id: reportId },
      data: { status: patch.status },
    });

    await writeModerationAuditLog({
      projectId,
      actorUserId: ownerId,
      action: `report_${patch.status}`,
      entityType: "report",
      entityId: reportId,
      details: { status: patch.status },
    });

    return jsonSuccess({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
