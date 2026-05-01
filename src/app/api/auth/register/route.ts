import bcrypt from "bcrypt";
import { promisify } from "util";
import { prisma } from "@/lib/prisma";
import { registerBodySchema } from "@/lib/validators/auth";
import { ConflictError } from "@/lib/utils/errors";
import { jsonError, jsonSuccess } from "@/lib/utils/response";

const hashAsync = promisify(bcrypt.hash);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerBodySchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }

    const passwordHash = await hashAsync(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        passwordHash,
      },
      select: { id: true, email: true, name: true },
    });

    return jsonSuccess({ user });
  } catch (err) {
    return jsonError(err);
  }
}
