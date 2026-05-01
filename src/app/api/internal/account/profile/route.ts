import { gravatarUrl } from "@/lib/gravatar";
import { prisma } from "@/lib/prisma";
import { requireOwnerId } from "@/lib/internal/project-access";
import { jsonError, jsonSuccess } from "@/lib/utils/response";
import { accountProfilePatchSchema } from "@/lib/validators/account";

export async function PATCH(request: Request) {
  try {
    const ownerId = await requireOwnerId();
    const body = accountProfilePatchSchema.parse(await request.json());

    const user = await prisma.user.update({
      where: { id: ownerId },
      data: { name: body.name },
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
