import { NextResponse } from "next/server";
import { requireSession } from "@/lib/server/auth";
import { isSupabaseConfigured, getSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const unauth = await requireSession(req);
  if (unauth) return unauth;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const url = new URL(req.url);
  const start = url.searchParams.get("start");
  const end = url.searchParams.get("end");
  const sb = getSupabaseServer();
  let q = sb.from("activity_logs").select("*");
  if (start) q = q.gte("activity_date", start);
  if (end) q = q.lte("activity_date", end);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ logs: data || [] });
}

export async function POST(req: Request) {
  const unauth = await requireSession(req);
  if (unauth) return unauth;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const body = await req.json();
  const { activity_id, activity_date, is_completed, snapshot } = body;
  const sb = getSupabaseServer();
  // upsert by (activity_id, activity_date)
  const payload = {
    activity_id,
    activity_date,
    is_completed,
    completed_at: is_completed ? new Date().toISOString() : null,
    activity_name_snapshot: snapshot?.name ?? "",
    category_snapshot: snapshot?.category ?? "",
    points_snapshot: snapshot?.points ?? 1,
    scheduled_time_snapshot: snapshot?.time ?? null,
  };
  const { data, error } = await sb.from("activity_logs")
    .upsert(payload, { onConflict: "activity_id,activity_date" })
    .select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ log: data });
}