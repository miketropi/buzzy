import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireOwnerId, requireProjectOwned, isUuid } from "@/lib/internal/project-access";
import { writeModerationAuditLog } from "@/lib/internal/moderation-audit";
import { NotFoundError } from "@/lib/utils/errors";
import { jsonError, jsonSuccess } from "@/lib/utils/response";
import { patchAppealBodySchema } from "@/lib/validators/appeal";

type RouteContext =
  | { params: Promise<{ projectId: string; appealId: string }> }
  | { params: { projectId: string; appealId: string } };

async function getParams(context: RouteContext) {
  const p = context.params;
  return p instanceof Promise ? await p : p;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId, appealId } = await getParams(context);
    await requireProjectOwned(projectId, ownerId);
    if (!isUuid(appealId)) {
      throw new NotFoundError("Appeal not found");
    }

    const patch = patchAppealBodySchema.parse(await request.json());

    const existing = await prisma.appeal.findFirst({
      where: { id: appealId, projectId },
    });
    if (!existing) {
      throw new NotFoundError("Appeal not found");
    }

    await prisma.appeal.update({
      where: { id: appealId },
      data: {
        status: patch.status,
        reviewedAt: patch.status === "open" ? null : new Date(),
      },
    });

    await writeModerationAuditLog({
      projectId,
      actorUserId: ownerId,
      action: `appeal_status_${patch.status}`,
      entityType: "appeal",
      entityId: appealId,
      details: { from: existing.status, to: patch.status },
    });

    return jsonSuccess({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
