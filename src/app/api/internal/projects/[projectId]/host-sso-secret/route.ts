import { randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";
import { requireOwnerId, requireProjectOwned } from "@/lib/internal/project-access";
import { jsonError, jsonSuccess } from "@/lib/utils/response";

type RouteContext = { params: Promise<{ projectId: string }> } | { params: { projectId: string } };

async function getParams(context: RouteContext) {
  const p = context.params;
  return p instanceof Promise ? await p : p;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId } = await getParams(context);
    await requireProjectOwned(projectId, ownerId);
    const row = await prisma.project.findFirst({
      where: { id: projectId },
      select: { embedSsoSecret: true },
    });
    return jsonSuccess({ configured: Boolean(row?.embedSsoSecret) });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId } = await getParams(context);
    await requireProjectOwned(projectId, ownerId);
    const secret = randomBytes(32).toString("base64url");
    await prisma.project.update({
      where: { id: projectId },
      data: { embedSsoSecret: secret },
    });
    return jsonSuccess({
      secret,
      notice:
        "Copy this secret into your server environment only. It is shown once per generation. Regenerating invalidates existing signed assertions.",
    });
  } catch (e) {
    return jsonError(e);
  }
}
