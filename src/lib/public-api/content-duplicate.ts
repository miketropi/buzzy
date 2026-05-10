import { createHash } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { ValidationError } from "@/lib/utils/errors";

export function duplicateBodyFingerprint(primaryText: string): string {
  const n = primaryText.toLowerCase().replace(/\s+/g, " ").trim();
  if (!n) return "";
  return createHash("sha256").update(n, "utf8").digest("hex");
}

export async function assertNoRecentDuplicateComment(args: {
  projectId: string;
  pageId: string;
  fingerprint: string;
  windowSeconds: number;
  excludeCommentId?: string;
}): Promise<void> {
  if (args.windowSeconds <= 0 || !args.fingerprint) return;

  const since = new Date(Date.now() - args.windowSeconds * 1000);

  const existing = await prisma.comment.findFirst({
    where: {
      projectId: args.projectId,
      pageId: args.pageId,
      duplicateBodyHash: args.fingerprint,
      createdAt: { gte: since },
      status: { not: "deleted" },
      ...(args.excludeCommentId ? { id: { not: args.excludeCommentId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    throw new ValidationError(
      "The same message was posted on this page recently. Wait before posting again or change the wording.",
    );
  }
}

export async function assertNoRecentDuplicateReview(args: {
  projectId: string;
  pageId: string;
  fingerprint: string;
  windowSeconds: number;
  excludeReviewId?: string;
}): Promise<void> {
  if (args.windowSeconds <= 0 || !args.fingerprint) return;

  const since = new Date(Date.now() - args.windowSeconds * 1000);

  const existing = await prisma.review.findFirst({
    where: {
      projectId: args.projectId,
      pageId: args.pageId,
      duplicateBodyHash: args.fingerprint,
      createdAt: { gte: since },
      status: { not: "deleted" },
      ...(args.excludeReviewId ? { id: { not: args.excludeReviewId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    throw new ValidationError(
      "The same message was posted on this page recently. Wait before posting again or change the wording.",
    );
  }
}

export function reviewDuplicateFingerprint(title: string | null, content: string | null): string {
  const base = `${title ?? ""}\n${content ?? ""}`.trim();
  if (!base) return "";
  return duplicateBodyFingerprint(base);
}
