import { prisma } from "@/lib/prisma";

export async function getOrCreateStaffCommenter(
  projectId: string,
  user: { id: string; name: string; avatar: string | null },
) {
  const existing = await prisma.commenter.findFirst({
    where: { projectId, provider: "staff", externalId: user.id },
  });
  if (existing) {
    if (existing.name !== user.name || existing.avatar !== user.avatar) {
      return prisma.commenter.update({
        where: { id: existing.id },
        data: { name: user.name, avatar: user.avatar },
      });
    }
    return existing;
  }
  return prisma.commenter.create({
    data: {
      projectId,
      provider: "staff",
      externalId: user.id,
      name: user.name,
      avatar: user.avatar,
      email: null,
    },
  });
}
