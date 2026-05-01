import type { Prisma } from "@prisma/client";

export const publicCommenterSelect = { select: { name: true, avatar: true } } as const;

export type CommentWithPublicCommenter = Prisma.CommentGetPayload<{
  include: { commenter: typeof publicCommenterSelect };
}>;
