import bcrypt from "bcrypt";
import { promisify } from "util";

import { prisma } from "@/lib/prisma";
import { requireOwnerId } from "@/lib/internal/project-access";
import { ValidationError } from "@/lib/utils/errors";
import { jsonError, jsonSuccess } from "@/lib/utils/response";
import { accountPasswordPatchSchema } from "@/lib/validators/account";

const compareAsync = promisify(bcrypt.compare);
const hashAsync = promisify(bcrypt.hash);

export async function PATCH(request: Request) {
  try {
    const ownerId = await requireOwnerId();
    const body = accountPasswordPatchSchema.parse(await request.json());

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: ownerId },
      select: { passwordHash: true },
    });

    const ok = await compareAsync(body.currentPassword, user.passwordHash);
    if (!ok) {
      throw new ValidationError("Current password is incorrect");
    }

    const passwordHash = await hashAsync(body.newPassword, 12);
    await prisma.user.update({
      where: { id: ownerId },
      data: { passwordHash },
    });

    return jsonSuccess({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
