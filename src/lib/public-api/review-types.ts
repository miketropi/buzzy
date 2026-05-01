import type { Prisma } from "@prisma/client";

import { publicCommenterSelect } from "@/lib/public-api/comment-types";

export type ReviewWithPublicCommenter = Prisma.ReviewGetPayload<{
  include: { commenter: typeof publicCommenterSelect };
}>;
