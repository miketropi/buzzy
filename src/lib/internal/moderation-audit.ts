import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function writeModerationAuditLog(args: {
  projectId: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown> | null;
}): Promise<void> {
  await prisma.moderationAuditLog.create({
    data: {
      projectId: args.projectId,
      actorUserId: args.actorUserId,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      details:
        args.details != null ? (args.details as Prisma.InputJsonValue) : undefined,
    },
  });
}
