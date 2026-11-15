"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export default function StatCard({ label, value, icon: Icon, accent = "gold" }: { label: string; value: string | number; icon: LucideIcon; accent?: "gold" | "crimson" | "emerald" }) {
  const color = accent === "crimson" ? "text-crimson-light" : accent === "emerald" ? "text-emerald" : "text-gold";
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="card p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted text-xs uppercase tracking-wider">{label}</span>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className={`font-display text-3xl ${color}`}>{value}</div>
    </motion.div>
  );
}