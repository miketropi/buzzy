import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashApiKey } from "@/lib/api-key";
import { domainsFromJson } from "@/lib/json-domains";
import { InvalidApiKeyError } from "@/lib/utils/errors";
import { assertOriginAllowed } from "@/lib/public-api/origin";
import { jsonError } from "@/lib/utils/response";
import { withPublicCors } from "@/lib/public-api/cors";
import type { ApiKey, Project } from "@prisma/client";

export type PublicApiContext = {
  request: NextRequest;
  rawKey: string;
  project: Project;
  apiKey: ApiKey;
  /** Reflect for CORS when present (null for some test-key curl calls). */
  allowedOrigin: string | null;
};

export function getRawApiKey(request: NextRequest): string | null {
  return request.headers.get("x-api-key") ?? request.nextUrl.searchParams.get("key");
}

export async function resolvePublicApiContext(request: NextRequest): Promise<PublicApiContext> {
  const rawKey = getRawApiKey(request);
  if (!rawKey?.trim()) {
    throw new InvalidApiKeyError("API key is required");
  }

  const row = await prisma.apiKey.findFirst({
    where: { keyHash: hashApiKey(rawKey.trim()), revokedAt: null },
    include: { project: true },
  });

  if (!row) {
    throw new InvalidApiKeyError();
  }

  const domains = domainsFromJson(row.project.allowedDomains);
  const allowedOrigin = assertOriginAllowed({
    originHeader: request.headers.get("origin"),
    refererHeader: request.headers.get("referer"),
    allowedDomainPatterns: domains,
    apiKeyEnvironment: row.environment,
  });

  void prisma.apiKey
    .update({
      where: { id: row.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {});

  const { project, ...apiKey } = row;
  return {
    request,
    rawKey: rawKey.trim(),
    project,
    apiKey,
    allowedOrigin,
  };
}

export async function runPublicApi(
  request: NextRequest,
  handler: (ctx: PublicApiContext) => Promise<Response>,
): Promise<Response> {
  try {
    const ctx = await resolvePublicApiContext(request);
    const res = await handler(ctx);
    return withPublicCors(request, res);
  } catch (e) {
    return withPublicCors(request, jsonError(e));
  }
}
