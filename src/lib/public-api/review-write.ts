import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { publicCommenterSelect } from "@/lib/public-api/comment-types";
import type { ReviewWithPublicCommenter } from "@/lib/public-api/review-types";
import { ConflictError } from "@/lib/utils/errors";

const include = { commenter: publicCommenterSelect };

export type CreateReviewInput = {
  projectId: string;
  pageId: string;
  commenterId: string;
  rating: number;
  categoryRatings?: Prisma.InputJsonValue;
  title: string | null;
  content: string | null;
  htmlContent?: string | null;
  attachments?: Prisma.InputJsonValue;
  status: string;
  submitterIp?: string | null;
  duplicateBodyHash?: string | null;
};

export async function createOrReviveReview(
  input: CreateReviewInput,
  allowMultipleReviews: boolean,
): Promise<ReviewWithPublicCommenter> {
  if (!allowMultipleReviews) {
    const active = await prisma.review.findFirst({
      where: {
        projectId: input.projectId,
        pageId: input.pageId,
        commenterId: input.commenterId,
        status: { in: ["approved", "pending"] },
      },
    });
    if (active) {
      throw new ConflictError("You already submitted a review for this page");
    }
  }

  try {
    return await prisma.review.create({
      data: {
        projectId: input.projectId,
        pageId: input.pageId,
        commenterId: input.commenterId,
        rating: input.rating,
        categoryRatings: input.categoryRatings ?? undefined,
        title: input.title,
        content: input.content,
        htmlContent: input.htmlContent ?? null,
        attachments: input.attachments ?? undefined,
        status: input.status,
        submitterIp: input.submitterIp ?? undefined,
        duplicateBodyHash: input.duplicateBodyHash ?? undefined,
      },
      include,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const existing = await prisma.review.findFirst({
        where: {
          projectId: input.projectId,
          pageId: input.pageId,
          commenterId: input.commenterId,
        },
      });
      if (existing?.status === "deleted") {
        return prisma.review.update({
          where: { id: existing.id },
          data: {
            rating: input.rating,
            categoryRatings: input.categoryRatings ?? Prisma.JsonNull,
            title: input.title,
            content: input.content,
            htmlContent: input.htmlContent ?? null,
            attachments: input.attachments ?? Prisma.JsonNull,
            status: input.status,
            submitterIp: input.submitterIp ?? undefined,
            duplicateBodyHash: input.duplicateBodyHash ?? undefined,
            editedAt: null,
            helpfulCount: 0,
            unhelpfulCount: 0,
          },
          include,
        });
      }
      throw new ConflictError("You already submitted a review for this page");
    }
    throw e;
  }
}
