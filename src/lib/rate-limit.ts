import { redis } from "@/lib/redis";

const KEY_PREFIX = "bz:rl:";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Fixed-window style limiter using INCR + EXPIRE (matches PRD §5.4).
 */
export async function rateLimit(
  scope: string,
  identifier: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  const key = `${KEY_PREFIX}${scope}:${identifier}`;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, windowSec);
  }
  const ttl = await redis.ttl(key);
  const resetAt = Date.now() + Math.max(0, ttl) * 1000;
  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
    resetAt,
  };
}
