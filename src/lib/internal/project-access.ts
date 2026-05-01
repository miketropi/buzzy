import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotFoundError, UnauthorizedError } from "@/lib/utils/errors";

export async function requireOwnerId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return session.user.id;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(id: string): boolean {
  return UUID_RE.test(id);
}

export async function requireProjectOwned(projectId: string, ownerId: string) {
  if (!isUuid(projectId)) {
    throw new NotFoundError("Project not found");
  }
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId },
  });
  if (!project) {
    throw new NotFoundError("Project not found");
  }
  return project;
}
