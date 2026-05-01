import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Reflect Origin so browsers can read JSON error bodies cross-origin. */
export function withPublicCors(request: NextRequest, response: Response): Response {
  const origin =
    request.headers.get("origin") ??
    ((): string | null => {
      const r = request.headers.get("referer");
      if (!r) return null;
      try {
        return new URL(r).origin;
      } catch {
        return null;
      }
    })();
  if (!origin) {
    return response;
  }
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  const vary = headers.get("Vary");
  headers.set("Vary", vary ? `${vary}, Origin` : "Origin");
  return new NextResponse(response.body, { status: response.status, headers });
}
