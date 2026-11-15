import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || "fallback-dev-secret-change-me");

export async function requireSession(req: Request): Promise<NextResponse | null> {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)ravan_session=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : null;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await jwtVerify(token, SECRET);
    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}