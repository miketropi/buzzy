import type { NextRequest } from "next/server";
import type { Project } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { verifyCommenterToken } from "@/lib/public-api/commenter-token";
import { BUZZY_HOST_IDENTITY_HEADER } from "@/lib/public-api/buzzy-host-identity-header";
import { HOST_SSO_PROVIDER, verifyHostSsoAssertion } from "@/lib/public-api/host-sso-assertion";
import { ForbiddenError } from "@/lib/utils/errors";
import type { EffectiveProjectSettings } from "@/lib/public-api/project-settings";

/**
 * Resolves the Buzzy commenter id for requests that may send either a host SSO
 * assertion or the anonymous device commenter token.
 *
 * If a host identity header is present and the project has SSO configured, an
 * invalid signature is rejected (does not fall through to anonymous).
 */
export async function resolveSessionCommenterId(
  request: NextRequest,
  project: Project,
  settings: EffectiveProjectSettings,
): Promise<string | null> {
  const rawHeader = request.headers.get(BUZZY_HOST_IDENTITY_HEADER)?.trim();
  if (rawHeader && project.embedSsoSecret) {
    const claims = verifyHostSsoAssertion(rawHeader, project.id, project.embedSsoSecret, {
      allowGuestEmail: settings.allowGuestEmail,
    });
    if (!claims) {
      throw new ForbiddenError("Invalid host identity assertion");
    }
    const row = await prisma.commenter.findFirst({
      where: {
        projectId: project.id,
        provider: HOST_SSO_PROVIDER,
        externalId: claims.sub,
      },
    });
    if (row?.isBanned) {
      throw new ForbiddenError();
    }
    return row?.id ?? null;
  }

  const tok = verifyCommenterToken(request.headers.get("x-commenter-token"), project.id);
  return tok?.commenterId ?? null;
}

export async function assertRequestActsAsCommenter(
  request: NextRequest,
  project: Project,
  settings: EffectiveProjectSettings,
  expectedCommenterId: string,
) {
  const token = verifyCommenterToken(request.headers.get("x-commenter-token"), project.id);
  if (token && token.commenterId === expectedCommenterId) {
    const row = await prisma.commenter.findFirst({
      where: { id: expectedCommenterId, projectId: project.id },
    });
    if (!row || row.isBanned) {
      throw new ForbiddenError("Commenter token does not match this content");
    }
    return;
  }

  const rawSso = request.headers.get(BUZZY_HOST_IDENTITY_HEADER)?.trim();
  if (rawSso && project.embedSsoSecret) {
    const claims = verifyHostSsoAssertion(rawSso, project.id, project.embedSsoSecret, {
      allowGuestEmail: settings.allowGuestEmail,
    });
    if (!claims) {
      throw new ForbiddenError("Invalid host identity assertion");
    }
    const row = await prisma.commenter.findFirst({
      where: {
        projectId: project.id,
        provider: HOST_SSO_PROVIDER,
        externalId: claims.sub,
      },
    });
    if (row && row.id === expectedCommenterId && !row.isBanned) {
      return;
    }
    throw new ForbiddenError("Host identity does not match this content");
  }

  throw new ForbiddenError("Commenter token does not match this content");
}
