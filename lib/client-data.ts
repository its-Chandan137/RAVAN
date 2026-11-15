import type { Activity, Completions } from "@/lib/ravan";
import type { ActivityLogRow } from "@/lib/db/types";

export function isSupabaseEnabled(): boolean {
  return typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  // client-side: process.env is inlined by Next.js for NEXT_PUBLIC_ vars
}

// Activities
export async function fetchActivities(): Promise<Activity[]> {
  if (!isSupabaseEnabled()) {
    // localStorage fallback
    const raw = typeof window !== "undefined" ? window.localStorage.getItem("ravan_activities") : null;
    return raw ? JSON.parse(raw) : [];
  }
  const res = await fetch("/api/activities", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load activities");
  const data = await res.json();
  return data.activities || [];
}

export async function createActivity(input: { name: string; category: string; time: string; group: Activity["group"]; points: number; enabled: boolean; order: number }): Promise<Activity> {
  if (!isSupabaseEnabled()) {
    const a: Activity = { id: "c_" + Date.now().toString(36), name: input.name, time: input.time, group: input.group, category: input.category, points: input.points, enabled: input.enabled, order: input.order };
    const raw = window.localStorage.getItem("ravan_activities");
    const list = raw ? JSON.parse(raw) : [];
    list.push(a);
    window.localStorage.setItem("ravan_activities", JSON.stringify(list));
    return a;
  }
  const res = await fetch("/api/activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      category: input.category,
      time_label: input.time,
      group_name: input.group,
      points: input.points,
      is_active: input.enabled,
      sort_order: input.order,
      schedule_days: [0,1,2,3,4,5,6],
    }),
  });
  if (!res.ok) throw new Error("Failed to create activity");
  const data = await res.json();
  return data.activity;
}

export async function updateActivity(id: string, patch: Partial<{ name: string; category: string; time: string; group: Activity["group"]; points: number; enabled: boolean; order: number }>): Promise<Activity> {
  if (!isSupabaseEnabled()) {
    const raw = window.localStorage.getItem("ravan_activities");
    const list: Activity[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((a) => a.id === id);
    if (idx >= 0) {
      if (patch.name !== undefined) list[idx].name = patch.name;
      if (patch.category !== undefined) list[idx].category = patch.category;
      if (patch.time !== undefined) list[idx].time = patch.time;
      if (patch.group !== undefined) list[idx].group = patch.group;
      if (patch.points !== undefined) list[idx].points = patch.points;
      if (patch.enabled !== undefined) list[idx].enabled = patch.enabled;
      if (patch.order !== undefined) list[idx].order = patch.order;
      window.localStorage.setItem("ravan_activities", JSON.stringify(list));
      return list[idx];
    }
    throw new Error("Activity not found");
  }
  const body: Record<string, unknown> = {};
  if (patch.name !== undefined) body.name = patch.name;
  if (patch.category !== undefined) body.category = patch.category;
  if (patch.time !== undefined) body.time_label = patch.time;
  if (patch.group !== undefined) body.group_name = patch.group;
  if (patch.points !== undefined) body.points = patch.points;
  if (patch.enabled !== undefined) body.is_active = patch.enabled;
  if (patch.order !== undefined) body.sort_order = patch.order;
  const res = await fetch(`/api/activities/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update activity");
  const data = await res.json();
  return data.activity;
}

export async function deleteActivity(id: string): Promise<void> {
  if (!isSupabaseEnabled()) {
    const raw = window.localStorage.getItem("ravan_activities");
    const list: Activity[] = raw ? JSON.parse(raw) : [];
    window.localStorage.setItem("ravan_activities", JSON.stringify(list.filter((a) => a.id !== id)));
    return;
  }
  const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete activity");
}

// Logs
export async function fetchLogs(start: string, end: string): Promise<ActivityLogRow[]> {
  if (!isSupabaseEnabled()) {
    // localStorage fallback: build logs from ravan_completions
    const raw = window.localStorage.getItem("ravan_completions");
    const comps: Completions = raw ? JSON.parse(raw) : {};
    const out: ActivityLogRow[] = [];
    for (const date of Object.keys(comps)) {
      if (date < start || date > end) continue;
      const day = comps[date] || {};
      for (const [aid, done] of Object.entries(day)) {
        out.push({
          id: `${aid}_${date}`,
          activity_id: aid,
          activity_name_snapshot: "",
          category_snapshot: "",
          points_snapshot: 1,
          scheduled_time_snapshot: null,
          activity_date: date,
          is_completed: !!done,
          completed_at: done ? new Date().toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
    return out;
  }
  const res = await fetch(`/api/logs?start=${start}&end=${end}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load logs");
  const data = await res.json();
  return data.logs || [];
}

export async function toggleLog(activity: Activity, date: string, completed: boolean): Promise<void> {
  if (!isSupabaseEnabled()) {
    const raw = window.localStorage.getItem("ravan_completions");
    const comps: Completions = raw ? JSON.parse(raw) : {};
    const day = { ...(comps[date] || {}) };
    day[activity.id] = completed;
    comps[date] = day;
    window.localStorage.setItem("ravan_completions", JSON.stringify(comps));
    return;
  }
  const res = await fetch("/api/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      activity_id: activity.id,
      activity_date: date,
      is_completed: completed,
      snapshot: { name: activity.name, category: activity.category, points: activity.points, time: activity.time },
    }),
  });
  if (!res.ok) throw new Error("Failed to save");
}
