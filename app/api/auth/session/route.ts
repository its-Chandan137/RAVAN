import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || "fallback-dev-secret-change-me");

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)ravan_session=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : null;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });
  try {
    await jwtVerify(token, SECRET);
    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}