import { NextResponse } from "next/server";
import { requireSession } from "@/lib/server/auth";
import { isSupabaseConfigured, getSupabaseServer } from "@/lib/supabase/server";
import { rowToActivity, activityToInsert } from "@/lib/mappers";
import { DEFAULT_ACTIVITIES } from "@/lib/ravan";

export async function GET(req: Request) {
  const unauth = await requireSession(req);
  if (unauth) return unauth;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const sb = getSupabaseServer();
  const { data, error } = await sb.from("activities").select("*").order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  let rows = data || [];
  if (rows.length === 0) {
    // seed defaults
    const inserts = DEFAULT_ACTIVITIES.map(activityToInsert);
    const { data: seeded, error: seedErr } = await sb.from("activities").insert(inserts).select();
    if (seedErr) return NextResponse.json({ error: seedErr.message }, { status: 500 });
    rows = seeded || [];
  }
  return NextResponse.json({ activities: rows.map(rowToActivity) });
}

export async function POST(req: Request) {
  const unauth = await requireSession(req);
  if (unauth) return unauth;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const body = await req.json();
  const sb = getSupabaseServer();
  const { data, error } = await sb.from("activities").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ activity: rowToActivity(data) });
}