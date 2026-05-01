import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ForbiddenError } from "@/lib/utils/errors";
import type { HostSsoClaims } from "@/lib/public-api/host-sso-assertion";
import { HOST_SSO_PROVIDER } from "@/lib/public-api/host-sso-assertion";
import type { EffectiveProjectSettings } from "@/lib/public-api/project-settings";

function mergeMetadata(
  prev: Prisma.JsonValue | null | undefined,
  username: string | undefined,
): Prisma.InputJsonValue | undefined {
  if (username === undefined) return undefined;
  const base =
    prev && typeof prev === "object" && !Array.isArray(prev)
      ? { ...(prev as Record<string, unknown>) }
      : ({} as Record<string, unknown>);
  if (username) base.username = username;
  else delete base.username;
  return base as Prisma.InputJsonValue;
}

export async function upsertHostSsoCommenter(
  projectId: string,
  claims: HostSsoClaims,
  settings: EffectiveProjectSettings,
): Promise<string> {
  const emailNorm =
    settings.allowGuestEmail && claims.email ? claims.email.trim() || null : null;

  const existing = await prisma.commenter.findFirst({
    where: {
      projectId,
      provider: HOST_SSO_PROVIDER,
      externalId: claims.sub,
    },
  });

  if (existing?.isBanned) {
    throw new ForbiddenError("Cannot post as this commenter");
  }

  const meta = mergeMetadata(existing?.metadata, claims.username);

  if (existing) {
    await prisma.commenter.update({
      where: { id: existing.id },
      data: {
        name: claims.name,
        email: emailNorm,
        avatar: claims.avatar ?? null,
        ...(meta !== undefined ? { metadata: meta } : {}),
      },
    });
    return existing.id;
  }

  const created = await prisma.commenter.create({
    data: {
      projectId,
      provider: HOST_SSO_PROVIDER,
      externalId: claims.sub,
      name: claims.name,
      email: emailNorm,
      avatar: claims.avatar ?? null,
      ...(meta !== undefined ? { metadata: meta } : {}),
    },
  });
  return created.id;
}
