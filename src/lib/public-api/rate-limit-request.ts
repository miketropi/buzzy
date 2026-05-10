import type { NextRequest } from "next/server";

import type { EffectiveProjectSettings } from "@/lib/public-api/project-settings";
import { rateLimit } from "@/lib/rate-limit";
import { RateLimitError } from "@/lib/utils/errors";

export function clientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Persisted on comments/reviews for analytics; null when IP cannot be determined. */
export function submitterIpFromRequest(request: NextRequest): string | null {
  const ip = clientIp(request).trim();
  if (!ip || ip === "unknown") return null;
  return ip.slice(0, 64);
}

export function rateLimitEnv(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export async function assertRateLimit(
  scope: string,
  identifier: string,
  limit: number,
  windowSec: number,
): Promise<void> {
  const r = await rateLimit(scope, identifier, limit, windowSec);
  if (!r.allowed) {
    throw new RateLimitError(r.resetAt);
  }
}

export async function assertCommentPostRateLimit(request: NextRequest) {
  const ip = clientIp(request);
  await assertRateLimit(
    "comments",
    ip,
    rateLimitEnv("RATE_LIMIT_COMMENTS", 5),
    60,
  );
}

export async function assertReviewPostRateLimit(request: NextRequest) {
  const ip = clientIp(request);
  await assertRateLimit(
    "reviews",
    ip,
    rateLimitEnv("RATE_LIMIT_REVIEWS", 3),
    3600,
  );
}

export async function assertVoteRateLimit(request: NextRequest) {
  const ip = clientIp(request);
  await assertRateLimit("votes", ip, rateLimitEnv("RATE_LIMIT_VOTES", 30), 60);
}

export async function assertReportRateLimit(request: NextRequest) {
  const ip = clientIp(request);
  await assertRateLimit(
    "reports",
    ip,
    rateLimitEnv("RATE_LIMIT_REPORTS", 10),
    3600,
  );
}

export async function assertUploadRateLimit(request: NextRequest) {
  const ip = clientIp(request);
  await assertRateLimit(
    "uploads",
    ip,
    rateLimitEnv("RATE_LIMIT_UPLOADS", 30),
    3600,
  );
}

function nonNegIntSetting(v: unknown, max: number): number {
  if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) return 0;
  return Math.min(max, Math.floor(v));
}

function identityWindowSec(settings: EffectiveProjectSettings): number {
  const w = settings.spamPerIdentityWindowSeconds;
  if (typeof w !== "number" || !Number.isFinite(w)) return 3600;
  return Math.min(604800, Math.max(60, Math.floor(w)));
}

/** Extra cap per visitor identity (Redis), on top of per-IP limits. */
export async function assertCommentPostRateLimitForIdentity(
  projectId: string,
  commenterId: string,
  settings: EffectiveProjectSettings,
): Promise<void> {
  const limit = nonNegIntSetting(settings.spamPerIdentityCommentLimit, 500);
  if (limit <= 0) return;
  await assertRateLimit(
    "comments:id",
    `${projectId}:${commenterId}`,
    limit,
    identityWindowSec(settings),
  );
}

export async function assertReviewPostRateLimitForIdentity(
  projectId: string,
  commenterId: string,
  settings: EffectiveProjectSettings,
): Promise<void> {
  const limit = nonNegIntSetting(settings.spamPerIdentityReviewLimit, 500);
  if (limit <= 0) return;
  await assertRateLimit(
    "reviews:id",
    `${projectId}:${commenterId}`,
    limit,
    identityWindowSec(settings),
  );
}

export async function assertAppealRateLimit(request: NextRequest) {
  const ip = clientIp(request);
  await assertRateLimit("appeals", ip, rateLimitEnv("RATE_LIMIT_APPEALS", 5), 3600);
}
