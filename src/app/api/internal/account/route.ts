import { gravatarUrl } from "@/lib/gravatar";
import { prisma } from "@/lib/prisma";
import { requireOwnerId } from "@/lib/internal/project-access";
import { jsonError, jsonSuccess } from "@/lib/utils/response";

export async function GET() {
  try {
    const ownerId = await requireOwnerId();
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: ownerId },
      select: { name: true, email: true },
    });
    return jsonSuccess({
      name: user.name,
      email: user.email,
      avatarUrl: gravatarUrl(user.email, 192),
    });
  } catch (e) {
    return jsonError(e);
  }
}
