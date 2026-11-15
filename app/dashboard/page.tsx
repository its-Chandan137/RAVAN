"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Flame, Loader2, Sparkles, Target, Trophy } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import type { Activity } from "@/lib/ravan";
import { DEFAULT_ACTIVITIES, todayIST, dateRangeDates, enabledActivities, dayAvailablePoints, dayEarnedPoints, dayCompletedCount } from "@/lib/ravan";
import { fetchActivities, fetchLogs } from "@/lib/client-data";
import type { ActivityLogRow } from "@/lib/db/types";

type RangeFilter = "weekly" | "monthly" | "last7" | "custom";
function logsToMap(logs: ActivityLogRow[]): Record<string, Record<string, boolean>> {
  const out: Record<string, Record<string, boolean>> = {};
  for (const log of logs) {
    if (!out[log.activity_date]) out[log.activity_date] = {};
    if (log.activity_id) out[log.activity_date][log.activity_id] = !!log.is_completed;
  }
  return out;
}
function shortDate(value: string) { return new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }); }

export default function DashboardHome() {
  const today = todayIST();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [logs, setLogs] = useState<ActivityLogRow[]>([]);
  const [todayLogs, setTodayLogs] = useState<ActivityLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RangeFilter>("weekly");
  const [customStart, setCustomStart] = useState(today);
  const [customEnd, setCustomEnd] = useState(today);
  const rangeDates = useMemo(() => dateRangeDates(filter, customStart, customEnd), [filter, customStart, customEnd]);

  useEffect(() => {
    let cancelled = false;
    fetchActivities().then((items) => { if (!cancelled) setActivities(items.length ? items : DEFAULT_ACTIVITIES); })
      .catch(() => {}).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!rangeDates.length) return;
    let cancelled = false;
    fetchLogs(rangeDates[0], rangeDates[rangeDates.length - 1]).then((items) => { if (!cancelled) setLogs(items); }).catch(() => {});
    return () => { cancelled = true; };
  }, [rangeDates]);
  useEffect(() => {
    let cancelled = false;
    fetchLogs(today, today).then((items) => { if (!cancelled) setTodayLogs(items); }).catch(() => {});
    return () => { cancelled = true; };
  }, [today]);

  const map = useMemo(() => logsToMap(logs), [logs]);
  const todayMap = useMemo(() => logsToMap(todayLogs), [todayLogs]);
  const enabled = enabledActivities(activities);
  const todayDone = dayCompletedCount(activities, todayMap[today] || {});
  const todayPct = enabled.length ? Math.round(todayDone / enabled.length * 100) : 0;
  const days = rangeDates.map((date) => {
    const future = date > today;
    const completion = map[date] || {};
    const available = future ? 0 : dayAvailablePoints(activities);
    const earned = future ? 0 : dayEarnedPoints(activities, completion);
    return { date, future, available, earned, done: future ? 0 : dayCompletedCount(activities, completion), pct: available ? Math.round(earned / available * 100) : 0 };
  });
  const totals = days.filter((day) => !day.future).reduce((sum, day) => ({ earned: sum.earned + day.earned, available: sum.available + day.available, done: sum.done + day.done }), { earned: 0, available: 0, done: 0 });
  const totalPct = totals.available ? Math.round(totals.earned / totals.available * 100) : 0;

  return <div className="page-stack overview-page">
    <PageHeader title="The path to mastery" subtitle="A clear view of your discipline, one day at a time." />
    <section className="welcome-banner">
      <div className="welcome-copy"><span className="eyebrow"><Sparkles size={13} /> {shortDate(today)} · YOUR DAILY BRIEFING</span><h2>Build your Lanka,<br /><em>one promise at a time.</em></h2><p>Strength is not a single victory. It is the practice you return to.</p>
        <Link href={`/dashboard/daily?date=${today}`} className="primary-action">{todayDone ? "Continue today" : "Begin today"}<ArrowRight size={17} /></Link>
      </div>
      <div className="welcome-art" aria-hidden="true"><div className="sun-disc" /><div className="temple-line temple-back" /><div className="temple-line temple-front" /><span className="art-star star-one">✦</span><span className="art-star star-two">✧</span><div className="welcome-ring"><span>{todayPct}<small>%</small></span><small>today</small></div></div>
    </section>

    <div className="overview-stats">
      <article className="stat-tile"><span className="stat-icon"><Target size={18} /></span><div><span>Today’s progress</span><strong>{todayDone}<small> / {enabled.length}</small></strong></div><b className="stat-accent">{todayPct}%</b></article>
      <article className="stat-tile"><span className="stat-icon"><Flame size={18} /></span><div><span>{filter === "monthly" ? "This period" : "Period points"}</span><strong>{totals.earned}<small> / {totals.available}</small></strong></div><b className="stat-accent">{totalPct}%</b></article>
      <article className="stat-tile"><span className="stat-icon"><Trophy size={18} /></span><div><span>Practices completed</span><strong>{totals.done}</strong></div><span className="stat-note">Keep showing up</span></article>
    </div>

    <section className="overview-panel">
      <div className="overview-heading"><div><span className="eyebrow">YOUR CONSISTENCY</span><h2>Progress overview</h2><p>Choose a period, then open any day to see its full detail.</p></div>
        <div className="range-tabs" role="tablist" aria-label="Progress period">{(["weekly", "monthly", "last7", "custom"] as RangeFilter[]).map((value) => <button key={value} role="tab" aria-selected={filter === value} className={filter === value ? "selected" : ""} onClick={() => setFilter(value)}>{value === "weekly" ? "This week" : value === "monthly" ? "This month" : value === "last7" ? "Last 7 days" : "Custom"}</button>)}</div>
      </div>
      {filter === "custom" && <div className="custom-range"><label>From<input type="date" value={customStart} max={today} onChange={(e) => { const value = e.target.value; setCustomStart(value); if (value > customEnd) setCustomEnd(value); }} /></label><label>To<input type="date" value={customEnd} min={customStart} max={today} onChange={(e) => setCustomEnd(e.target.value)} /></label></div>}
      <div className="period-progress"><div><span>Overall completion</span><strong>{totalPct}%</strong></div><div className="progress-track"><motion.div initial={{ width: 0 }} animate={{ width: `${totalPct}%` }} transition={{ duration: .65 }} /></div></div>
      <div className="days-heading"><h3>Day by day</h3><span>{days.filter((day) => !day.future).length} days · {totals.done} practices completed</span></div>
      {loading ? <div className="loading-state compact"><Loader2 className="w-5 h-5 animate-spin" /> Gathering your progress…</div> : <div className="day-list">{days.map((day, index) => <Link key={day.date} href={day.future ? "#" : `/dashboard/daily?date=${day.date}`} aria-disabled={day.future} onClick={(e) => { if (day.future) e.preventDefault(); }} className={`day-item ${day.future ? "is-future" : ""}`}>
        <span className={`day-check ${day.done ? "complete" : ""}`}>{day.done ? <Check size={14} /> : <span>{index + 1}</span>}</span><span className="day-name"><strong>{shortDate(day.date)}</strong><small>{day.future ? "Up ahead" : day.date === today ? "Today · open daily detail" : "Open daily detail"}</small></span>
        <span className="day-count">{day.future ? "—" : `${day.done} practices`}</span><span className="day-points">{day.future ? "—" : `${day.earned}/${day.available} pts`}</span><span className="mini-progress"><i style={{ width: `${day.pct}%` }} /></span><strong className="day-percent">{day.future ? "—" : `${day.pct}%`}</strong><ArrowRight className="day-arrow" size={16} />
      </Link>)}</div>}
    </section>
  </div>;
}
