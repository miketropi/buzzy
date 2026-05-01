import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (req.method === "OPTIONS" && req.nextUrl.pathname.startsWith("/api/v1")) {
    const origin = req.headers.get("origin") ?? "*";
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        Vary: "Origin",
        "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, X-API-Key, X-Commenter-Token, X-Buzzy-Host-Identity, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (req.nextUrl.pathname.startsWith("/api/v1")) {
    return NextResponse.next();
  }

  if (req.auth) {
    return NextResponse.next();
  }

  if (req.nextUrl.pathname.startsWith("/api/internal")) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Unauthorized",
        },
      },
      { status: 401 },
    );
  }

  const login = new URL("/login", req.nextUrl.origin);
  login.searchParams.set("callbackUrl", `${req.nextUrl.pathname}${req.nextUrl.search}`);
  return NextResponse.redirect(login);
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/internal/:path*", "/api/v1/:path*"],
};
