import { Prisma } from "@prisma/client";

import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { requireOwnerId, requireProjectOwned } from "@/lib/internal/project-access";
import { toProjectResponse } from "@/lib/internal/serialize-project";
import { jsonError, jsonSuccess } from "@/lib/utils/response";
import { patchProjectBodySchema } from "@/lib/validators/project";

type RouteContext = { params: Promise<{ projectId: string }> } | { params: { projectId: string } };

async function getParams(context: RouteContext) {
  const p = context.params;
  return p instanceof Promise ? await p : p;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId } = await getParams(context);
    const project = await requireProjectOwned(projectId, ownerId);
    return jsonSuccess(toProjectResponse(project));
  } catch (e) {
    return jsonError(e);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId } = await getParams(context);
    await requireProjectOwned(projectId, ownerId);
    const patch = patchProjectBodySchema.parse(await request.json());
    const data: Prisma.ProjectUpdateInput = {};
    if (patch.name !== undefined) data.name = patch.name;
    if (patch.allowedDomains !== undefined) {
      data.allowedDomains = patch.allowedDomains as Prisma.InputJsonValue;
    }
    if (patch.widgetMode !== undefined) data.widgetMode = patch.widgetMode;
    const project = await prisma.project.update({
      where: { id: projectId },
      data,
    });
    void redis.del(`bz:cfg:${projectId}`).catch(() => {});
    return jsonSuccess(toProjectResponse(project));
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId } = await getParams(context);
    await requireProjectOwned(projectId, ownerId);
    await prisma.project.delete({ where: { id: projectId } });
    return jsonSuccess({ deleted: true });
  } catch (e) {
    return jsonError(e);
  }
}
