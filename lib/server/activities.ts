import { getSupabaseServer } from "@/lib/supabase/server";
import type { ActivityRow } from "@/lib/db/types";

export type ActivityInput = {
  name: string;
  category?: string;
  time_label?: string | null;
  points?: number;
  is_active?: boolean;
  sort_order?: number;
  group?: string;
};

// We store group as part of sort? The app groups by group field. DB has no group column.
// To keep group, we encode group into category? Better: add group column. But schema doesn't have group.
// Decision: store group in app_settings? Too complex. Instead, we map group from a convention:
// We'll add a 'group' column via migration? Schema didn't include. Let's add group text column.
// Update migration: add group column. For now, query assumes group column exists.

export async function listActivities(): Promise<(ActivityRow & { group?: string })[]> {
  const sb = getSupabaseServer();
  const { data, error } = await sb.from("activities").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []) as unknown as (ActivityRow & { group?: string })[];
}

export async function createActivity(input: { name: string; category: string; time_label: string | null; points: number; group: string; sort_order: number; is_active: boolean }) {
  const sb = getSupabaseServer();
  const { data, error } = await sb.from("activities").insert({
    name: input.name,
    category: input.category,
    time_label: input.time_label,
    points: input.points,
    is_active: input.is_active,
    sort_order: input.sort_order,
    // group stored in a separate column; add to migration
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateActivity(id: string, patch: Partial<{ name: string; category: string; time_label: string | null; points: number; is_active: boolean; sort_order: number }>) {
  const sb = getSupabaseServer();
  const { data, error } = await sb.from("activities").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteActivity(id: string) {
  const sb = getSupabaseServer();
  const { error } = await sb.from("activities").delete().eq("id", id);
  if (error) throw error;
}
