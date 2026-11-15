export type ActivityGroup = "Morning" | "Office" | "Evening";

export type Activity = {
  id: string;
  name: string;
  time: string;
  group: ActivityGroup;
  category: string;
  points: number;
  enabled: boolean;
  order: number;
};

export const GROUP_TITLES: Record<ActivityGroup, string> = {
  Morning: "Morning — Personal Growth",
  Office: "Office Hours",
  Evening: "Evening — 8 PM to Midnight",
};

export const GROUP_ORDER: ActivityGroup[] = ["Morning", "Office", "Evening"];

export const CATEGORIES = [
  "Personal Growth",
  "Health",
  "Study",
  "Career",
  "Office Work",
  "Leisure",
  "Rest",
  "Other",
];

export const DEFAULT_ACTIVITIES: Activity[] = [
  // Morning
  { id: "m1", name: "Wake up, freshen up", time: "6:00–6:30", group: "Morning", category: "Personal Growth", points: 1, enabled: true, order: 0 },
  { id: "m2", name: "Park: walk/jog/run", time: "6:30–7:30", group: "Morning", category: "Health", points: 1, enabled: true, order: 1 },
  { id: "m3", name: "Return, cool down", time: "7:30–8:00", group: "Morning", category: "Health", points: 1, enabled: true, order: 2 },
  { id: "m4", name: "Shower", time: "8:00–8:30", group: "Morning", category: "Personal Growth", points: 1, enabled: true, order: 3 },
  { id: "m5", name: "Breakfast", time: "8:30–9:00", group: "Morning", category: "Health", points: 1, enabled: true, order: 4 },
  { id: "m6", name: "Get ready", time: "9:00–9:30", group: "Morning", category: "Personal Growth", points: 1, enabled: true, order: 5 },
  { id: "m7", name: "Travel to office", time: "9:30–10:00", group: "Morning", category: "Office Work", points: 1, enabled: true, order: 6 },
  { id: "m8", name: "Buffer / settle in", time: "10:00–10:30", group: "Morning", category: "Office Work", points: 1, enabled: true, order: 7 },
  // Office
  { id: "o1", name: "Office work / study when available", time: "10:30–1:30", group: "Office", category: "Office Work", points: 1, enabled: true, order: 0 },
  { id: "o2", name: "Lunch", time: "1:30–2:30", group: "Office", category: "Health", points: 1, enabled: true, order: 1 },
  { id: "o3", name: "Office work + flexible study", time: "2:30–7:30", group: "Office", category: "Office Work", points: 1, enabled: true, order: 2 },
  // Evening
  { id: "e1", name: "Hostel, freshen up, relax", time: "8:00–8:20", group: "Evening", category: "Rest", points: 1, enabled: true, order: 0 },
  { id: "e2", name: "Dinner", time: "8:20–8:50", group: "Evening", category: "Health", points: 1, enabled: true, order: 1 },
  { id: "e3", name: "Job applications + HR outreach", time: "8:50–9:35", group: "Evening", category: "Career", points: 1, enabled: true, order: 2 },
  { id: "e4", name: "DSA / frontend practice", time: "9:35–10:20", group: "Evening", category: "Study", points: 1, enabled: true, order: 3 },
  { id: "e5", name: "Prepare for gaming", time: "10:20–10:30", group: "Evening", category: "Leisure", points: 1, enabled: true, order: 4 },
  { id: "e6", name: "Honour of Kings with friends ❤️", time: "10:30–12:00", group: "Evening", category: "Leisure", points: 1, enabled: true, order: 5 },
  { id: "e7", name: "Wind down", time: "12:00–12:20", group: "Evening", category: "Rest", points: 1, enabled: true, order: 6 },
  { id: "e8", name: "Sleep target", time: "12:20", group: "Evening", category: "Rest", points: 1, enabled: true, order: 7 },
];

export type Completions = Record<string, Record<string, boolean>>;

export function todayIST(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

export function weekStart(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const dow = dt.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  dt.setDate(dt.getDate() + diff);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

export function weekDays(mondayStr: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < 7; i++) out.push(addDays(mondayStr, i));
  return out;
}

export function isFuture(dateStr: string): boolean {
  return dateStr > todayIST();
}

export function enabledActivities(activities: Activity[]): Activity[] {
  return activities.filter((a) => a.enabled).sort((a, b) => {
    if (a.group !== b.group) return GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group);
    return a.order - b.order;
  });
}

export function dayAvailablePoints(activities: Activity[]): number {
  return enabledActivities(activities).reduce((s, a) => s + (a.points || 0), 0);
}

export function dayEarnedPoints(activities: Activity[], completion: Record<string, boolean> | undefined): number {
  if (!completion) return 0;
  return enabledActivities(activities).reduce((s, a) => s + (completion[a.id] ? a.points || 0 : 0), 0);
}

export function dayCompletedCount(activities: Activity[], completion: Record<string, boolean> | undefined): number {
  if (!completion) return 0;
  return enabledActivities(activities).filter((a) => completion[a.id]).length;
}

export type RangeFilter = "weekly" | "monthly" | "last7" | "custom";

export function dateRangeDates(filter: RangeFilter, customStart: string, customEnd: string): string[] {
  const today = todayIST();
  let start: string;
  let end: string;
  if (filter === "weekly") {
    start = weekStart(today);
    end = addDays(start, 6);
  } else if (filter === "monthly") {
    const [y, m] = today.split("-");
    start = `${y}-${m}-01`;
    const last = new Date(Number(y), Number(m), 0).getDate();
    end = `${y}-${m}-${String(last).padStart(2, "0")}`;
  } else if (filter === "last7") {
    start = addDays(today, -6);
    end = today;
  } else {
    start = customStart || today;
    end = customEnd || today;
    if (end < start) end = start;
  }
  const out: string[] = [];
  let cur = start;
  let guard = 0;
  while (cur <= end && guard < 400) {
    out.push(cur);
    cur = addDays(cur, 1);
    guard++;
  }
  return out;
}