import { prisma } from "@/lib/prisma";
import { formatApiKeyPrefix, generateApiKeyValue, hashApiKey } from "@/lib/api-key";
import { requireOwnerId, requireProjectOwned } from "@/lib/internal/project-access";
import { jsonError, jsonSuccess } from "@/lib/utils/response";
import { createApiKeyBodySchema } from "@/lib/validators/project";

type Ctx = { params: { projectId: string } };

export async function GET(_request: Request, context: Ctx) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId } = context.params;
    await requireProjectOwned(projectId, ownerId);
    const keys = await prisma.apiKey.findMany({
      where: { projectId, revokedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        environment: true,
        keyPrefix: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
    return jsonSuccess(keys);
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(request: Request, context: Ctx) {
  try {
    const ownerId = await requireOwnerId();
    const { projectId } = context.params;
    await requireProjectOwned(projectId, ownerId);
    const body = createApiKeyBodySchema.parse(await request.json());
    const fullKey = generateApiKeyValue(body.environment);
    const row = await prisma.apiKey.create({
      data: {
        projectId,
        keyHash: hashApiKey(fullKey),
        keyPrefix: formatApiKeyPrefix(fullKey),
        name: body.name ?? "Default",
        environment: body.environment,
      },
    });
    return jsonSuccess({
      id: row.id,
      name: row.name,
      environment: row.environment,
      keyPrefix: row.keyPrefix,
      createdAt: row.createdAt,
      key: fullKey,
      notice: "Copy this secret now — it cannot be shown again.",
    });
  } catch (e) {
    return jsonError(e);
  }
}
