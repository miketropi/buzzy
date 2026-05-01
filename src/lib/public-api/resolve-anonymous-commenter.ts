import { prisma } from "@/lib/prisma";
import { verifyCommenterToken } from "@/lib/public-api/commenter-token";
import {
  BUZZY_HOST_IDENTITY_HEADER,
  verifyHostSsoAssertion,
} from "@/lib/public-api/host-sso-assertion";
import { upsertHostSsoCommenter } from "@/lib/public-api/resolve-host-sso-commenter";
import type { PublicApiContext } from "@/lib/public-api/handler";
import type { EffectiveProjectSettings } from "@/lib/public-api/project-settings";
import { ForbiddenError } from "@/lib/utils/errors";

export async function resolveAnonymousCommenterId(
  ctx: PublicApiContext,
  body: { commenter: { name: string; email?: string | "" } },
  settings: EffectiveProjectSettings,
): Promise<string> {
  const rawSso = ctx.request.headers.get(BUZZY_HOST_IDENTITY_HEADER)?.trim();
  if (rawSso && ctx.project.embedSsoSecret) {
    const claims = verifyHostSsoAssertion(rawSso, ctx.project.id, ctx.project.embedSsoSecret, {
      allowGuestEmail: settings.allowGuestEmail,
    });
    if (!claims) {
      throw new ForbiddenError("Invalid host identity assertion");
    }
    return upsertHostSsoCommenter(ctx.project.id, claims, settings);
  }

  const token = ctx.request.headers.get("x-commenter-token");
  const verified = verifyCommenterToken(token, ctx.project.id);
  if (verified) {
    const row = await prisma.commenter.findFirst({
      where: { id: verified.commenterId, projectId: ctx.project.id },
    });
    if (!row || row.isBanned) {
      throw new ForbiddenError("Cannot post as this commenter");
    }
    return row.id;
  }

  if (!settings.allowAnonymous) {
    throw new ForbiddenError("Anonymous comments are disabled for this project");
  }

  const emailNorm =
    settings.allowGuestEmail && body.commenter.email
      ? body.commenter.email.trim() || null
      : null;

  if (emailNorm) {
    const existing = await prisma.commenter.findFirst({
      where: {
        projectId: ctx.project.id,
        provider: "anonymous",
        email: emailNorm,
      },
    });
    if (existing) {
      if (existing.isBanned) {
        throw new ForbiddenError();
      }
      await prisma.commenter.update({
        where: { id: existing.id },
        data: { name: body.commenter.name },
      });
      return existing.id;
    }
  }

  const created = await prisma.commenter.create({
    data: {
      projectId: ctx.project.id,
      name: body.commenter.name,
      email: emailNorm,
      provider: "anonymous",
    },
  });
  return created.id;
}
