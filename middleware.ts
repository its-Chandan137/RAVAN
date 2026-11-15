export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || "fallback-dev-secret-change-me");

const PUBLIC = ["/login", "/api/auth/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    // allow login page; if already authed, redirect to dashboard
    if (pathname === "/login") {
      const token = req.cookies.get("ravan_session")?.value;
      if (token) {
        try {
          await jwtVerify(token, SECRET);
          return NextResponse.redirect(new URL("/dashboard", req.url));
        } catch {}
      }
    }
    return NextResponse.next();
  }

  // protect everything else (dashboard, api except auth)
  if (pathname.startsWith("/api/")) {
    // allow session check? protect too
  }

  const token = req.cookies.get("ravan_session")?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }
  try {
    await jwtVerify(token, SECRET);
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};