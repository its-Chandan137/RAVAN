"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GripVertical, RotateCcw, AlertTriangle, Save, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import type { Activity } from "@/lib/ravan";
import { GROUP_TITLES, GROUP_ORDER, DEFAULT_ACTIVITIES, CATEGORIES } from "@/lib/ravan";
import {
  fetchActivities, createActivity, updateActivity, deleteActivity,
} from "@/lib/client-data";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function SettingsPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [newAct, setNewAct] = useState({ name: "", time: "", group: "Morning" as Activity["group"], category: "Personal Growth", points: 1 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Activity>>({});
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const a = await fetchActivities();
      setActivities(a.length ? a : DEFAULT_ACTIVITIES);
    } catch (e: unknown) {
      setError(errorMessage(e, "Failed to load"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(a: Activity) {
    setEditingId(a.id);
    setEditDraft({ ...a });
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    try {
      const updated = await updateActivity(editingId, editDraft);
      setActivities((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
      setEditingId(null);
      setEditDraft({});
      setMsg("Activity updated.");
    } catch (e: unknown) {
      setError(errorMessage(e, "Save failed"));
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft({});
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this activity? Historical records are preserved.")) return;
    try {
      await deleteActivity(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
      setMsg("Activity deleted.");
    } catch (e: unknown) {
      setError(errorMessage(e, "Delete failed"));
    }
  }

  async function toggleEnabled(a: Activity) {
    try {
      const updated = await updateActivity(a.id, { enabled: !a.enabled });
      setActivities((prev) => prev.map((x) => (x.id === a.id ? updated : x)));
    } catch (e: unknown) {
      setError(errorMessage(e, "Update failed"));
    }
  }

  async function move(a: Activity, dir: -1 | 1) {
    const sameGroup = activities.filter((x) => x.group === a.group).sort((x, y) => x.order - y.order);
    const idx = sameGroup.findIndex((x) => x.id === a.id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= sameGroup.length) return;
    const other = sameGroup[newIdx];
    try {
      const u1 = await updateActivity(a.id, { order: other.order });
      const u2 = await updateActivity(other.id, { order: a.order });
      setActivities((prev) => prev.map((x) => {
        if (x.id === a.id) return u1;
        if (x.id === other.id) return u2;
        return x;
      }));
    } catch (e: unknown) {
      setError(errorMessage(e, "Reorder failed"));
    }
  }

  async function addActivity() {
    if (!newAct.name.trim()) return;
    const groupActs = activities.filter((a) => a.group === newAct.group);
    const maxOrder = groupActs.reduce((m, a) => Math.max(m, a.order), -1);
    setSaving(true);
    try {
      const created = await createActivity({
        name: newAct.name.trim(),
        category: newAct.category,
        time: newAct.time.trim() || "—",
        group: newAct.group,
        points: newAct.points || 1,
        enabled: true,
        order: maxOrder + 1,
      });
      setActivities((prev) => [...prev, created]);
      setNewAct({ name: "", time: "", group: "Morning", category: "Personal Growth", points: 1 });
      setShowAdd(false);
      setMsg("Activity added.");
    } catch (e: unknown) {
      setError(errorMessage(e, "Add failed"));
    } finally {
      setSaving(false);
    }
  }

  async function restoreDefaults() {
    if (!confirm("Restore the original timetable? Completion history is preserved.")) return;
    // Re-create defaults via API: delete all then seed by inserting defaults
    try {
      for (const a of activities) {
        await deleteActivity(a.id);
      }
      for (const d of DEFAULT_ACTIVITIES) {
        await createActivity({
          name: d.name,
          category: d.category,
          time: d.time,
          group: d.group,
          points: d.points,
          enabled: d.enabled,
          order: d.order,
        });
      }
      await load();
      setMsg("Default timetable restored.");
    } catch (e: unknown) {
      setError(errorMessage(e, "Restore failed"));
    }
  }

  async function clearAll() {
    if (!confirm("This will delete all activities and completion history. Continue?")) return;
    // Note: completion history (activity_logs) is preserved in DB; only activities removed.
    try {
      for (const a of activities) {
        await deleteActivity(a.id);
      }
      setActivities([]);
      setMsg("All activities deleted.");
    } catch (e: unknown) {
      setError(errorMessage(e, "Clear failed"));
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
    router.refresh();
  }

  const grouped = GROUP_ORDER.map((g) => ({
    group: g,
    title: GROUP_TITLES[g],
    items: activities.filter((a) => a.group === g).sort((a, b) => a.order - b.order),
  }));

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-gold animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage your tracker."
        action={
          <button onClick={() => setShowAdd((s) => !s)} className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Activity
          </button>
        }
      />

      {error && <div className="card p-3 mb-4 text-crimson-light text-sm">{error}</div>}

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="card p-5 mb-4 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={newAct.name} onChange={(e) => setNewAct({ ...newAct, name: e.target.value })} placeholder="Activity name" className="input-field" />
              <input value={newAct.time} onChange={(e) => setNewAct({ ...newAct, time: e.target.value })} placeholder="Time (e.g. 6:00–6:30)" className="input-field" />
              <select value={newAct.group} onChange={(e) => setNewAct({ ...newAct, group: e.target.value as Activity["group"] })} className="input-field">
                {GROUP_ORDER.map((g) => <option key={g} value={g}>{GROUP_TITLES[g]}</option>)}
              </select>
              <select value={newAct.category} onChange={(e) => setNewAct({ ...newAct, category: e.target.value })} className="input-field">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input type="number" min={0} value={newAct.points} onChange={(e) => setNewAct({ ...newAct, points: Number(e.target.value) })} placeholder="Points" className="input-field" />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={addActivity} disabled={saving} className="btn-primary px-4 py-2 rounded-lg text-sm">{saving ? "Saving..." : "Save"}</button>
              <button onClick={() => setShowAdd(false)} className="btn-ghost px-4 py-2 rounded-lg text-sm">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {grouped.map(({ group, title, items }) => (
        <div key={group} className="card p-4 mb-4">
          <h3 className="font-display text-gold mb-3">{title}</h3>
          {items.length === 0 && <p className="text-muted text-sm">No activities.</p>}
          <div className="space-y-2">
            {items.map((a, idx) => (
              <div key={a.id} className="p-3 rounded-lg bg-bg3/40 border border-border">
                {editingId === a.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input value={editDraft.name ?? ""} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} className="input-field" placeholder="Name" />
                      <input value={editDraft.time ?? ""} onChange={(e) => setEditDraft({ ...editDraft, time: e.target.value })} className="input-field" placeholder="Time" />
                      <select value={editDraft.group ?? a.group} onChange={(e) => setEditDraft({ ...editDraft, group: e.target.value as Activity["group"] })} className="input-field">
                        {GROUP_ORDER.map((g) => <option key={g} value={g}>{GROUP_TITLES[g]}</option>)}
                      </select>
                      <select value={editDraft.category ?? a.category} onChange={(e) => setEditDraft({ ...editDraft, category: e.target.value })} className="input-field">
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                      <input type="number" min={0} value={editDraft.points ?? a.points} onChange={(e) => setEditDraft({ ...editDraft, points: Number(e.target.value) })} className="input-field" placeholder="Points" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={saveEdit} disabled={saving} className="btn-primary px-3 py-1.5 rounded text-xs flex items-center gap-1"><Save className="w-3 h-3" /> Save</button>
                      <button onClick={cancelEdit} className="btn-ghost px-3 py-1.5 rounded text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <GripVertical className="w-4 h-4 text-muted shrink-0" />
                    <button onClick={() => move(a, -1)} disabled={idx === 0} className="text-muted hover:text-gold disabled:opacity-30 text-xs">↑</button>
                    <button onClick={() => move(a, 1)} disabled={idx === items.length - 1} className="text-muted hover:text-gold disabled:opacity-30 text-xs">↓</button>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${a.enabled ? "text-text" : "text-muted line-through"}`}>{a.name}</div>
                      <div className="text-xs text-muted">{a.time} · {a.category} · {a.points}pt</div>
                    </div>
                    <button
                      onClick={() => toggleEnabled(a)}
                      className={`px-2 py-1 rounded text-xs border ${a.enabled ? "border-gold/40 text-gold" : "border-border text-muted"}`}
                    >
                      {a.enabled ? "Enabled" : "Disabled"}
                    </button>
                    <button onClick={() => startEdit(a)} className="btn-ghost px-2 py-1 rounded text-xs">Edit</button>
                    <button onClick={() => handleDelete(a.id)} className="text-muted hover:text-crimson-light"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <h3 className="font-display text-gold mb-2 flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Restore Default Timetable</h3>
          <p className="text-muted text-sm mb-3">Reset activities to the original timetable. Completion history is preserved.</p>
          <button onClick={restoreDefaults} className="btn-ghost px-4 py-2 rounded-lg text-sm">Restore Defaults</button>
        </div>
        <div className="card p-5">
          <h3 className="font-display text-gold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-crimson-light" /> Danger Zone</h3>
          <p className="text-muted text-sm mb-3">Delete all activities. Completion history in DB is preserved.</p>
          <button onClick={clearAll} className="btn-ghost px-4 py-2 rounded-lg text-sm text-crimson-light border-crimson/40 hover:bg-crimson/10">Clear All Activities</button>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-display text-gold mb-2">Session</h3>
        <button onClick={handleLogout} className="btn-ghost px-4 py-2 rounded-lg text-sm">Logout</button>
      </div>

      {msg && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gold text-sm mt-4">{msg}</motion.p>}
    </div>
  );
}
