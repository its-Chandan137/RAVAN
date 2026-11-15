"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Circle, Loader2 } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import type { Activity } from "@/lib/ravan";
import { DEFAULT_ACTIVITIES, GROUP_ORDER, GROUP_TITLES, todayIST, addDays, enabledActivities, dayAvailablePoints, dayEarnedPoints, dayCompletedCount } from "@/lib/ravan";
import { fetchActivities, fetchLogs, toggleLog } from "@/lib/client-data";
import type { ActivityLogRow } from "@/lib/db/types";

function logsToMap(logs: ActivityLogRow[]): Record<string, Record<string, boolean>> {
  const out: Record<string, Record<string, boolean>> = {};
  for (const log of logs) {
    if (!out[log.activity_date]) out[log.activity_date] = {};
    if (log.activity_id) out[log.activity_date][log.activity_id] = !!log.is_completed;
  }
  return out;
}

function niceDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function DailyPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [date, setDate] = useState(todayIST());
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [followsToday, setFollowsToday] = useState(true);

  useEffect(() => {
    const requestedDate = new URLSearchParams(window.location.search).get("date");
    if (requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      setDate(requestedDate);
      setFollowsToday(requestedDate === todayIST());
    }
  }, []);
  useEffect(() => {
    if (!followsToday) return;
    const timer = window.setInterval(() => {
      const today = todayIST();
      setDate((current) => current === today ? current : today);
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [followsToday]);
  useEffect(() => {
    let cancelled = false;
    fetchActivities().then((items) => { if (!cancelled) setActivities(items.length ? items : DEFAULT_ACTIVITIES); })
      .catch((e) => { if (!cancelled) setError(e.message); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    let cancelled = false;
    fetchLogs(date, date).then((logs) => { if (!cancelled) setCompletions(logsToMap(logs)[date] || {}); }).catch(() => {});
    return () => { cancelled = true; };
  }, [date]);

  const enabled = useMemo(() => enabledActivities(activities), [activities]);
  const available = dayAvailablePoints(activities);
  const earned = dayEarnedPoints(activities, completions);
  const completed = dayCompletedCount(activities, completions);
  const pct = available ? Math.round(earned / available * 100) : 0;

  const toggle = useCallback(async (id: string) => {
    const activity = activities.find((item) => item.id === id);
    if (!activity) return;
    const nextValue = !completions[id];
    setCompletions((current) => ({ ...current, [id]: nextValue }));
    try { await toggleLog(activity, date, nextValue); }
    catch (e) {
      setCompletions((current) => ({ ...current, [id]: !nextValue }));
      setError(e instanceof Error ? e.message : "Could not save this update.");
    }
  }, [activities, completions, date]);

  if (loading) return <div className="loading-state"><Loader2 className="w-6 h-6 animate-spin" /> Preparing your day…</div>;

  return (
    <div className="page-stack">
      <Link href="/dashboard" className="back-link"><ArrowLeft size={16} /> Back to overview</Link>
      <PageHeader title="A day of discipline" subtitle="Small actions, repeated with intention, become mastery." />
      {error && <div className="notice-error" role="alert">{error}</div>}

      <section className="day-hero">
        <div className="day-hero-top">
          <div>
            <span className="eyebrow">YOUR DAILY PRACTICE</span>
            <h2>{date === todayIST() ? "Today, with purpose." : niceDate(date)}</h2>
            <p>{date === todayIST() ? niceDate(date) : "Review your commitments for this day."}</p>
          </div>
          <div className="day-score"><strong>{pct}<small>%</small></strong><span>complete</span></div>
        </div>
        <div className="progress-track"><motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: .7, ease: "easeOut" }} /></div>
        <div className="day-hero-bottom">
          <span><b>{completed}</b> of {enabled.length} practices</span><span><b>{earned}</b> / {available} points</span>
          <div className="date-switcher">
            <button aria-label="Previous day" onClick={() => { setFollowsToday(false); setDate(addDays(date, -1)); }}><ChevronLeft size={17} /></button>
            {date !== todayIST() && <button className="today-link" onClick={() => { setFollowsToday(true); setDate(todayIST()); }}>Today</button>}
            <button aria-label="Next day" disabled={date >= todayIST()} onClick={() => { const nextDate = addDays(date, 1); setFollowsToday(nextDate === todayIST()); setDate(nextDate); }}><ChevronRight size={17} /></button>
          </div>
        </div>
      </section>

      <div className="section-heading"><div><span className="eyebrow">THE DAILY RITUAL</span><h2>Your commitments</h2></div><span className="muted-copy">Tap a practice to mark it done</span></div>
      <div className="practice-groups">
        {GROUP_ORDER.map((group) => {
          const items = enabled.filter((item) => item.group === group);
          if (!items.length) return null;
          return <section className="practice-card" key={group}>
            <div className="practice-title"><span className="practice-mark">✦</span><h3>{GROUP_TITLES[group]}</h3><span>{items.filter((item) => completions[item.id]).length}/{items.length}</span></div>
            {group === "Office" && <p className="practice-note">Study target: 2 hours. Adjust to your workload; work responsibilities come first.</p>}
            <div className="practice-list">{items.map((item) => {
              const done = !!completions[item.id];
              return <button key={item.id} onClick={() => toggle(item.id)} className={`practice-row ${done ? "is-done" : ""}`} aria-pressed={done}>
                <span className="check-mark">{done ? <Check size={15} /> : <Circle size={17} />}</span>
                <span className="practice-time">{item.time}</span><span className="practice-name">{item.name}</span><span className="practice-points">{item.points} pt</span>
              </button>;
            })}</div>
          </section>;
        })}
      </div>
      <Link className="next-link" href="/dashboard/weekly">See your weekly rhythm <ArrowRight size={16} /></Link>
    </div>
  );
}
