"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export function LandingStatCard({
  label,
  value,
  delta,
  icon: Icon,
  accent,
  index = 0,
}: {
  label: string;
  value: number | string;
  delta?: string;
  icon: LucideIcon;
  accent: "fire" | "boof" | "intel" | "trust";
  index?: number;
}) {
  const accents = {
    fire: {
      icon: "bg-[#39FF88]/15 text-[#39FF88] shadow-[0_0_20px_rgba(57,255,136,0.2)]",
      border: "border-[#39FF88]/25",
      delta: "text-[#39FF88]",
    },
    boof: {
      icon: "bg-[#FF3B3B]/15 text-[#FF3B3B] shadow-[0_0_20px_rgba(255,59,59,0.2)]",
      border: "border-[#FF3B3B]/25",
      delta: "text-[#FF3B3B]",
    },
    intel: {
      icon: "bg-[#FF7A00]/15 text-[#FF7A00] shadow-[0_0_20px_rgba(255,122,0,0.15)]",
      border: "border-[#FF7A00]/25",
      delta: "text-[#FF7A00]",
    },
    trust: {
      icon: "bg-[#9AC434]/15 text-[#9AC434] shadow-[0_0_20px_rgba(154,196,52,0.15)]",
      border: "border-[#9AC434]/25",
      delta: "text-[#9AC434]",
    },
  };

  const style = accents[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className={`flex min-w-[148px] flex-1 flex-col gap-3 rounded-xl border bg-[var(--bg-card)] p-4 lg:min-w-0 lg:p-5 ${style.border}`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${style.icon}`}
      >
        <Icon className="h-4 w-4" strokeWidth={2.25} />
      </div>
      <div>
        <p className="font-display text-3xl font-black tabular-nums tracking-tight text-[var(--text-main)] sm:text-4xl">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="mt-1 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          {label}
        </p>
        {delta && (
          <p className={`mt-1 text-xs font-semibold ${style.delta}`}>{delta}</p>
        )}
      </div>
    </motion.div>
  );
}
