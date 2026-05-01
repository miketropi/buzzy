import { prisma } from "@/lib/prisma";
import { requireOwnerId, requireProjectOwned, isUuid } from "@/lib/internal/project-access";
import { NotFoundError } from "@/lib/utils/errors";
import { jsonError, jsonSuccess } from "@/lib/utils/response";

type Ctx = { params: { projectId: string; keyId: string } };

export async function DELETE(_request: Request, context: Ctx) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId, keyId } = context.params;
    if (!isUuid(keyId)) {
      throw new NotFoundError("API key not found");
    }
    await requireProjectOwned(projectId, ownerId);
    const res = await prisma.apiKey.updateMany({
      where: { id: keyId, projectId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (res.count === 0) {
      throw new NotFoundError("API key not found");
    }
    return jsonSuccess({ revoked: true });
  } catch (e) {
    return jsonError(e);
  }
}
