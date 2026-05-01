import { Prisma } from "@prisma/client";

import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { requireOwnerId, requireProjectOwned } from "@/lib/internal/project-access";
import { defaultProjectSettings } from "@/lib/project-defaults";
import { toProjectResponse } from "@/lib/internal/serialize-project";
import { jsonError, jsonSuccess } from "@/lib/utils/response";
import { projectSettingsPatchSchema } from "@/lib/validators/project";

type Ctx = { params: { projectId: string } };

function mergeSettings(
  current: Record<string, unknown> | null | undefined,
  patch: Record<string, unknown>,
) {
  const defs = defaultProjectSettings() as Record<string, unknown>;
  const base = { ...defs, ...(current ?? {}) };
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) {
      base[k] = v;
    }
  }
  return base;
}

export async function PATCH(request: Request, context: Ctx) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId } = context.params;
    const project = await requireProjectOwned(projectId, ownerId);
    const patch = projectSettingsPatchSchema.parse(await request.json());
    const currentSettings =
      project.settings && typeof project.settings === "object"
        ? (project.settings as Record<string, unknown>)
        : null;
    const merged = mergeSettings(currentSettings, patch as Record<string, unknown>);
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { settings: merged as Prisma.InputJsonValue },
    });
    void redis.del(`bz:cfg:${projectId}`).catch(() => {});
    return jsonSuccess(toProjectResponse(updated));
  } catch (e) {
    return jsonError(e);
  }
}
