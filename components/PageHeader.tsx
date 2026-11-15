"use client";

import { motion } from "framer-motion";

export default function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
    >
      <div>
        <h1 className="font-display text-3xl lg:text-4xl text-gold gold-glow">{title}</h1>
        {subtitle && <p className="text-muted text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}