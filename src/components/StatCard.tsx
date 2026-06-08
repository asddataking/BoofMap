"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "emerald",
  index = 0,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: "emerald" | "gold" | "red" | "orange" | "purple";
  index?: number;
}) {
  const accents = {
    emerald: "bg-emerald-500/15 text-emerald-400",
    gold: "bg-orange-500/15 text-orange-400",
    red: "bg-red-500/15 text-red-400",
    orange: "bg-orange-500/15 text-orange-400",
    purple: "bg-purple-500/15 text-purple-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="glass-card flex min-w-[140px] flex-col gap-3 p-4"
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${accents[accent]}`}
      >
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div>
        <p className="font-heading text-2xl font-bold tracking-tight text-white">
          {value}
        </p>
        <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
          {label}
        </p>
      </div>
    </motion.div>
  );
}
