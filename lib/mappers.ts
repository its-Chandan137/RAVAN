import type { Activity } from "@/lib/ravan";
import type { ActivityRow } from "@/lib/db/types";

export function rowToActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    name: row.name,
    time: row.time_label || "—",
    group: (row.group_name as Activity["group"]) || "Morning",
    category: row.category,
    points: row.points,
    enabled: row.is_active,
    order: row.sort_order,
  };
}

export function activityToInsert(a: Activity) {
  return {
    id: a.id,
    name: a.name,
    category: a.category,
    time_label: a.time,
    group_name: a.group,
    points: a.points,
    is_active: a.enabled,
    sort_order: a.order,
    schedule_days: [0, 1, 2, 3, 4, 5, 6],
  };
}