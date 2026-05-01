import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { buildPublicWidgetConfig } from "@/lib/public-api/widget-config";
import { getEffectiveSettings } from "@/lib/public-api/project-settings";
import { runPublicApi } from "@/lib/public-api/handler";
import { redis } from "@/lib/redis";
import { publicConfigQuerySchema } from "@/lib/validators/comment";

const CACHE_TTL_SEC = 300;
const skipConfigCache = process.env.NODE_ENV === "development";

export async function GET(request: NextRequest) {
  return runPublicApi(request, async (ctx) => {
    const raw = Object.fromEntries(request.nextUrl.searchParams);
    publicConfigQuerySchema.parse(raw);

    const cacheKey = `bz:cfg:${ctx.project.id}`;
    if (!skipConfigCache) {
      try {
        const hit = await redis.get(cacheKey);
        if (hit) {
          return new NextResponse(hit, {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      } catch {
        /* continue without cache */
      }
    }

    const settings = getEffectiveSettings(ctx.project.settings);
    const data = buildPublicWidgetConfig(ctx.project, settings);
    const body = JSON.stringify({ success: true, data });

    if (!skipConfigCache) {
      try {
        await redis.setex(cacheKey, CACHE_TTL_SEC, body);
      } catch {
        /* ignore */
      }
    }

    return new NextResponse(body, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
}
