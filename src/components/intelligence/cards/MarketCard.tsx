"use client";

import { motion } from "framer-motion";

export function MarketCard({
  label,
  value,
  emoji,
  status,
  index = 0,
}: {
  label: string;
  value: string | number;
  emoji: string;
  status?: "positive" | "negative" | "neutral";
  index?: number;
}) {
  const statusColors = {
    positive: "border-[#39FF88]/30 text-[#39FF88]",
    negative: "border-[#FF3B3B]/30 text-[#FF3B3B]",
    neutral: "border-[#FFD23F]/30 text-[#FFD23F]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08 }}
      className={`relative overflow-hidden rounded-xl border bg-[var(--bg-card)] p-4 ${statusColors[status ?? "neutral"]}`}
    >
      <div className="absolute right-2 top-2 text-lg opacity-60">{emoji}</div>
      <p className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-2 font-display text-xl font-black uppercase tracking-tight">
        {value}
      </p>
    </motion.div>
  );
}
