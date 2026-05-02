import type { NextRequest } from "next/server";

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
