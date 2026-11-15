"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, CalendarDays, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import type { Activity, Completions } from "@/lib/ravan";
import {
  GROUP_TITLES, GROUP_ORDER, DEFAULT_ACTIVITIES,
  todayIST, addDays, enabledActivities, dayAvailablePoints, dayEarnedPoints, dayCompletedCount,
  dateRangeDates,
} from "@/lib/ravan";
import {
  fetchActivities, fetchLogs, toggleLog, createActivity, updateActivity, deleteActivity,
  isSupabaseEnabled,
} from "@/lib/client-data";
import type { ActivityLogRow } from "@/lib/db/types";

type RangeFilter = "weekly" | "monthly" | "last7" | "custom";

function logsToMap(logs: ActivityLogRow[]): Record<string, Record<string, boolean>> {
  const out: Record<string, Record<string, boolean>> = {};
  for (const l of logs) {
    if (!out[l.activity_date]) out[l.activity_date] = {};
    if (l.activity_id) out[l.activity_date][l.activity_id] = !!l.is_completed;
  }
  return out;
}

export default function DailyPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingAct, setLoadingAct] = useState(true);
  const [error, setError] = useState("");

  const [date, setDate] = useState(todayIST());
  const [completionsByDate, setCompletionsByDate] = useState<Record<string, Record<string, boolean>>>({});

  const [rangeFilter, setRangeFilter] = useState<RangeFilter>("weekly");
  const [customStart, setCustomStart] = useState(todayIST());
  const [customEnd, setCustomEnd] = useState(todayIST());

  const [overviewLogs, setOverviewLogs] = useState<ActivityLogRow[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(false);

  const rangeDates = useMemo(() => dateRangeDates(rangeFilter, customStart, customEnd), [rangeFilter, customStart, customEnd]);

  // load activities
  useEffect(() => {
    let cancelled = false;
    setLoadingAct(true);
    fetchActivities()
      .then((a) => { if (!cancelled) { setActivities(a.length ? a : DEFAULT_ACTIVITIES); setError(""); } })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoadingAct(false); });
    return () => { cancelled = true; };
  }, []);

  // load completion for selected date
  useEffect(() => {
    let cancelled = false;
    fetchLogs(date, date)
      .then((logs) => {
        if (cancelled) return;
        const m = logsToMap(logs);
        setCompletionsByDate((prev) => ({ ...prev, [date]: m[date] || {} }));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [date]);

  // load overview logs
  useEffect(() => {
    if (rangeDates.length === 0) return;
    let cancelled = false;
    setLoadingOverview(true);
    fetchLogs(rangeDates[0], rangeDates[rangeDates.length - 1])
      .then((logs) => { if (!cancelled) setOverviewLogs(logs); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingOverview(false); });
    return () => { cancelled = true; };
  }, [rangeDates]);

  const completion = completionsByDate[date] || {};
  const enabled = enabledActivities(activities);
  const available = dayAvailablePoints(activities);
  const earned = dayEarnedPoints(activities, completion);
  const pct = available > 0 ? Math.round((earned / available) * 100) : 0;
  const doneCount = dayCompletedCount(activities, completion);
  const totalCount = enabled.length;

  const overviewMap = useMemo(() => logsToMap(overviewLogs), [overviewLogs]);

  const overview = useMemo(() => {
    let totalAvail = 0, totalEarned = 0, totalDone = 0, totalSlots = 0;
    const daily = rangeDates.map((d) => {
      const future = d > todayIST();
      const avail = future ? 0 : dayAvailablePoints(activities);
      const dayComp = overviewMap[d] || {};
      const ern = future ? 0 : dayEarnedPoints(activities, dayComp);
      const done = future ? 0 : dayCompletedCount(activities, dayComp);
      const slots = future ? 0 : enabled.length;
      totalAvail += avail; totalEarned += ern; totalDone += done; totalSlots += slots;
      const p = avail > 0 ? Math.round((ern / avail) * 100) : 0;
      return { date: d, future, avail, earned: ern, done, slots, pct: p };
    });
    const p = totalAvail > 0 ? Math.round((totalEarned / totalAvail) * 100) : 0;
    return { dates: daily, totalAvail, totalEarned, totalDone, totalSlots, pct: p };
  }, [rangeDates, activities, overviewMap, enabled.length]);

  const toggle = useCallback(async (id: string) => {
    const act = activities.find((a) => a.id === id);
    if (!act) return;
    const newVal = !completion[id];
    // optimistic update
    setCompletionsByDate((prev) => {
      const day = { ...(prev[date] || {}) };
      day[id] = newVal;
      return { ...prev, [date]: day };
    });
    try {
      await toggleLog(act, date, newVal);
    } catch (e: any) {
      // revert
      setCompletionsByDate((prev) => {
        const day = { ...(prev[date] || {}) };
        day[id] = !newVal;
        return { ...prev, [date]: day };
      });
      setError(e?.message || "Save failed");
    }
  }, [activities, completion, date]);

  const groups = GROUP_ORDER;
  const rangeLabel = rangeFilter === "weekly" ? "Current week (Mon–Sun)"
    : rangeFilter === "monthly" ? "Current month"
    : rangeFilter === "last7" ? "Last 7 days"
    : `${customStart} → ${customEnd}`;

  if (loadingAct) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Daily Tracker" subtitle="Tick your activities. One minute a day." />
      {error && <div className="card p-3 mb-4 text-crimson-light text-sm">{error}</div>}

      {/* Progress Overview */}
      <div className="card p-5 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="font-display text-gold">Progress Overview</h3>
            <p className="text-muted text-xs mt-1">{rangeLabel}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["weekly", "monthly", "last7", "custom"] as RangeFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setRangeFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${rangeFilter === f ? "bg-gold/15 border-gold text-gold" : "border-border text-muted hover:text-gold"}`}
              >
                {f === "weekly" ? "Weekly" : f === "monthly" ? "Monthly" : f === "last7" ? "Last 7 Days" : "Custom Range"}
              </button>
            ))}
          </div>
        </div>

        {rangeFilter === "custom" && (
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <label className="text-muted text-xs">Start Date</label>
              <input type="date" value={customStart} onChange={(e) => {
                const v = e.target.value;
                setCustomStart(v);
                if (v > customEnd) setCustomEnd(v);
              }} className="input-field mt-1" />
            </div>
            <div className="flex-1">
              <label className="text-muted text-xs">End Date</label>
              <input type="date" value={customEnd} min={customStart} onChange={(e) => {
                const v = e.target.value;
                if (v >= customStart) setCustomEnd(v);
              }} className="input-field mt-1" />
            </div>
          </div>
        )}

        {loadingOverview ? (
          <div className="flex items-center justify-center py-6"><Loader2 className="w-5 h-5 text-gold animate-spin" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="text-center">
                <div className="text-muted text-xs uppercase">Completion</div>
                <div className="font-display text-3xl text-gold gold-glow">{overview.pct}%</div>
              </div>
              <div className="text-center">
                <div className="text-muted text-xs uppercase">Points</div>
                <div className="font-display text-2xl text-gold">{overview.totalEarned}/{overview.totalAvail}</div>
              </div>
              <div className="text-center">
                <div className="text-muted text-xs uppercase">Completed</div>
                <div className="font-display text-2xl text-emerald">{overview.totalDone}</div>
              </div>
              <div className="text-center">
                <div className="text-muted text-xs uppercase">Incomplete</div>
                <div className="font-display text-2xl text-crimson-light">{overview.totalSlots - overview.totalDone}</div>
              </div>
            </div>

            <div className="h-3 bg-bg3 rounded-full overflow-hidden mb-4">
              <motion.div initial={{ width: 0 }} animate={{ width: `${overview.pct}%` }} transition={{ duration: 0.5 }} className="h-full bg-gradient-to-r from-gold-dark to-gold" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted uppercase">
                    <th className="text-left py-1">Day</th>
                    <th className="text-right py-1">Earned</th>
                    <th className="text-right py-1">Available</th>
                    <th className="text-right py-1">%</th>
                    <th className="py-1 pl-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {overview.dates.map((d) => (
                    <tr key={d.date} className="border-t border-border/40">
                      <td className="py-1 text-text">{d.date}</td>
                      <td className="py-1 text-right text-gold">{d.future ? "—" : d.earned}</td>
                      <td className="py-1 text-right text-muted">{d.future ? "—" : d.avail}</td>
                      <td className="py-1 text-right text-gold">{d.future ? "—" : `${d.pct}%`}</td>
                      <td className="py-1 pl-2 w-1/3">
                        {!d.future && (
                          <div className="h-1.5 bg-bg3 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-gold-dark to-gold" style={{ width: `${d.pct}%` }} />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Date navigation for timetable */}
      <div className="card p-4 mb-4 flex items-center justify-between gap-3">
        <button onClick={() => setDate(addDays(date, -1))} className="btn-ghost p-2 rounded-lg">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-gold" />
          <span className="font-display text-gold">{date}</span>
          {date !== todayIST() && (
            <button onClick={() => setDate(todayIST())} className="btn-ghost px-2 py-1 rounded text-xs">Today</button>
          )}
        </div>
        <button onClick={() => setDate(addDays(date, 1))} className="btn-ghost p-2 rounded-lg" disabled={date >= todayIST()}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted text-xs uppercase tracking-wider">Completion</span>
          <span className="text-gold font-display">{pct}%</span>
        </div>
        <div className="h-2 bg-bg3 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} className="h-full bg-gradient-to-r from-gold-dark to-gold" />
        </div>
        <div className="text-muted text-xs mt-2">{doneCount}/{totalCount} activities · {earned}/{available} points</div>
      </div>

      <div className="space-y-4">
        {groups.map((g) => {
          const acts = enabled.filter((a) => a.group === g);
          if (acts.length === 0) return null;
          return (
            <div key={g} className="card p-4">
              <h3 className="font-display text-gold mb-3">{GROUP_TITLES[g]}</h3>
              {g === "Office" && (
                <p className="text-muted text-xs mb-3 italic">Office study target: 2 hours. Actual study time can be 1–3 hours depending on workload. Work responsibilities take priority.</p>
              )}
              <div className="space-y-1">
                {acts.map((a) => {
                  const done = !!completion[a.id];
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggle(a.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${done ? "bg-gold/10" : "hover:bg-bg3/50"}`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${done ? "bg-gold border-gold" : "border-border"}`}>
                        {done && <Check className="w-3 h-3 text-bg" />}
                      </div>
                      <span className="text-muted text-xs w-24 shrink-0">{a.time}</span>
                      <span className={`text-sm flex-1 ${done ? "line-through text-muted" : "text-text"}`}>{a.name}</span>
                      <span className="text-[10px] text-muted">{a.points}pt</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}