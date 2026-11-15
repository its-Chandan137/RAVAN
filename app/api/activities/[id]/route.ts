import { NextResponse } from "next/server";
import { requireSession } from "@/lib/server/auth";
import { isSupabaseConfigured, getSupabaseServer } from "@/lib/supabase/server";
import { rowToActivity } from "@/lib/mappers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireSession(req);
  if (unauth) return unauth;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const { id } = await params;
  const body = await req.json();
  const sb = getSupabaseServer();
  const { data, error } = await sb.from("activities").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ activity: rowToActivity(data) });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await requireSession(req);
  if (unauth) return unauth;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const { id } = await params;
  const sb = getSupabaseServer();
  const { error } = await sb.from("activities").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}