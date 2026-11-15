"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import type { Activity } from "@/lib/ravan";
import {
  DEFAULT_ACTIVITIES, todayIST, weekStart, weekDays, addDays,
  enabledActivities, dayAvailablePoints, dayEarnedPoints,
} from "@/lib/ravan";
import { fetchActivities, fetchLogs } from "@/lib/client-data";
import type { ActivityLogRow } from "@/lib/db/types";

function isFuture(d: string) { return d > todayIST(); }

function logsToMap(logs: ActivityLogRow[]): Record<string, Record<string, boolean>> {
  const out: Record<string, Record<string, boolean>> = {};
  for (const l of logs) {
    if (!out[l.activity_date]) out[l.activity_date] = {};
    if (l.activity_id) out[l.activity_date][l.activity_id] = !!l.is_completed;
  }
  return out;
}

export default function WeeklyPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [logs, setLogs] = useState<ActivityLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  const currentWeek = weekStart(todayIST());
  const [viewWeek, setViewWeek] = useState(currentWeek);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchActivities()
      .then((a) => { if (!cancelled) setActivities(a.length ? a : DEFAULT_ACTIVITIES); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const days = weekDays(viewWeek);

  useEffect(() => {
    let cancelled = false;
    fetchLogs(days[0], days[6])
      .then((l) => { if (!cancelled) setLogs(l); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [viewWeek]);

  const enabled = enabledActivities(activities);
  const logMap = useMemo(() => logsToMap(logs), [logs]);

  const dayStats = days.map((d) => {
    const future = isFuture(d);
    const avail = future ? 0 : dayAvailablePoints(activities);
    const comp = logMap[d] || {};
    const earned = future ? 0 : dayEarnedPoints(activities, comp);
    const pct = avail > 0 ? Math.round((earned / avail) * 100) : null;
    const doneCount = future ? 0 : enabled.filter((a) => comp[a.id]).length;
    const totalCount = future ? 0 : enabled.length;
    return { date: d, future, avail, earned, pct, doneCount, totalCount };
  });

  const weekAvail = dayStats.reduce((s, x) => s + x.avail, 0);
  const weekEarned = dayStats.reduce((s, x) => s + x.earned, 0);
  const weekPct = weekAvail > 0 ? Math.round((weekEarned / weekAvail) * 100) : 0;
  const weekDone = dayStats.reduce((s, x) => s + x.doneCount, 0);
  const weekTotal = dayStats.reduce((s, x) => s + x.totalCount, 0);
  const weekIncomplete = weekTotal - weekDone;

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const isCurrentWeek = viewWeek === currentWeek;

  function prevWeek() { setViewWeek(addDays(viewWeek, -7)); }
  function nextWeek() { if (viewWeek < currentWeek) setViewWeek(addDays(viewWeek, 7)); }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="text-gold font-display animate-pulse">Loading...</div></div>;
  }

  return (
    <div>
      <PageHeader title="Weekly Progress" subtitle="Consistency is the throne of Lanka." />

      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevWeek} className="btn-ghost p-2 rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
          <div className="text-center">
            <div className="text-muted text-xs uppercase tracking-wider">Week of</div>
            <div className="font-display text-gold">{viewWeek}</div>
            {isCurrentWeek && <div className="text-[10px] text-muted">(current week)</div>}
          </div>
          <button onClick={nextWeek} className="btn-ghost p-2 rounded-lg" disabled={viewWeek >= currentWeek}><ChevronRight className="w-4 h-4" /></button>
        </div>

        <div className="text-center mb-4">
          <div className="font-display text-5xl text-gold gold-glow">{weekPct}%</div>
          <div className="text-muted text-sm mt-1">Weekly Completion</div>
        </div>

        <div className="h-3 bg-bg3 rounded-full overflow-hidden mb-4">
          <motion.div initial={{ width: 0 }} animate={{ width: `${weekPct}%` }} transition={{ duration: 0.6 }} className="h-full bg-gradient-to-r from-gold-dark to-gold" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-muted text-xs uppercase">Points</div>
            <div className="font-display text-gold">{weekEarned}/{weekAvail}</div>
          </div>
          <div>
            <div className="text-muted text-xs uppercase">Completed</div>
            <div className="font-display text-emerald">{weekDone}</div>
          </div>
          <div>
            <div className="text-muted text-xs uppercase">Incomplete</div>
            <div className="font-display text-crimson-light">{weekIncomplete}</div>
          </div>
          <div>
            <div className="text-muted text-xs uppercase">Activities</div>
            <div className="font-display text-gold">{weekTotal}</div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-display text-gold mb-3">Daily Breakdown</h3>
        <div className="grid grid-cols-7 gap-2">
          {dayStats.map((ds, i) => (
            <div key={ds.date} className="text-center">
              <div className="text-muted text-xs mb-1">{dayLabels[i]}</div>
              <div className={`aspect-square rounded-lg flex items-center justify-center font-display text-sm border ${ds.future ? "border-border text-muted/40" : ds.pct !== null && ds.pct >= 80 ? "border-gold/40 text-gold bg-gold/10" : "border-border text-text"}`}>
                {ds.future ? "—" : `${ds.pct}%`}
              </div>
              {!ds.future && (
                <div className="text-[10px] text-muted mt-1">{ds.earned}/{ds.avail}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}