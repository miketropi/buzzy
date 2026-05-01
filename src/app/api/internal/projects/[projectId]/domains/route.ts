import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { domainsFromJson } from "@/lib/json-domains";
import { requireOwnerId, requireProjectOwned } from "@/lib/internal/project-access";
import { jsonError, jsonSuccess } from "@/lib/utils/response";
import { putDomainsBodySchema } from "@/lib/validators/project";

type Ctx = { params: { projectId: string } };

export async function PUT(request: Request, context: Ctx) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId } = context.params;
    await requireProjectOwned(projectId, ownerId);
    const body = putDomainsBodySchema.parse(await request.json());
    const project = await prisma.project.update({
      where: { id: projectId },
      data: { allowedDomains: body.allowedDomains as Prisma.InputJsonValue },
    });
    return jsonSuccess({ allowedDomains: domainsFromJson(project.allowedDomains) });
  } catch (e) {
    return jsonError(e);
  }
}
