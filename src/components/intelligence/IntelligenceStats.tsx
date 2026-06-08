"use client";

import { motion } from "framer-motion";
import { Brain, DollarSign, Flame, Skull } from "lucide-react";
import { useIntelligenceStats } from "@/hooks/useIntelligenceData";
import { AnimatedCounter } from "./AnimatedCounter";

const STAT_CONFIG = [
  {
    key: "fire_found" as const,
    label: "Fire Found",
    emoji: "🔥",
    icon: Flame,
    accent: "fire" as const,
    deltaKey: "fire_today" as const,
  },
  {
    key: "boof_exposed" as const,
    label: "Boof Exposed",
    emoji: "🚨",
    icon: Skull,
    accent: "boof" as const,
    deltaKey: "boof_today" as const,
  },
  {
    key: "community_savings" as const,
    label: "Community Savings",
    emoji: "💰",
    icon: DollarSign,
    accent: "value" as const,
    prefix: "$",
    deltaKey: null,
  },
  {
    key: "verified_signals" as const,
    label: "Verified Signals",
    emoji: "🧠",
    icon: Brain,
    accent: "intel" as const,
    deltaKey: null,
  },
];

const ACCENTS = {
  fire: {
    border: "border-[#39FF88]/25",
    icon: "bg-[#39FF88]/15 text-[#39FF88] shadow-[0_0_20px_rgba(57,255,136,0.2)]",
    delta: "text-[#39FF88]",
  },
  boof: {
    border: "border-[#FF3B3B]/25",
    icon: "bg-[#FF3B3B]/15 text-[#FF3B3B] shadow-[0_0_20px_rgba(255,59,59,0.2)]",
    delta: "text-[#FF3B3B]",
  },
  value: {
    border: "border-[#FFD23F]/25",
    icon: "bg-[#FFD23F]/15 text-[#FFD23F] shadow-[0_0_20px_rgba(255,210,63,0.15)]",
    delta: "text-[#FFD23F]",
  },
  intel: {
    border: "border-[#9AC434]/25",
    icon: "bg-[#9AC434]/15 text-[#9AC434] shadow-[0_0_20px_rgba(154,196,52,0.15)]",
    delta: "text-[#9AC434]",
  },
};

export function IntelligenceStats() {
  const stats = useIntelligenceStats();

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin lg:grid lg:grid-cols-4 lg:overflow-visible">
      {STAT_CONFIG.map((cfg, i) => {
        const style = ACCENTS[cfg.accent];
        const Icon = cfg.icon;
        const value = stats[cfg.key];
        const delta =
          cfg.deltaKey != null
            ? `+${stats[cfg.deltaKey]} today`
            : cfg.key === "verified_signals"
              ? "Community confirmed"
              : "Estimated savings";

        return (
          <motion.div
            key={cfg.key}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className={`flex min-w-[148px] flex-1 flex-col gap-3 rounded-xl border bg-[var(--bg-card)] p-4 lg:min-w-0 lg:p-5 ${style.border}`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${style.icon}`}
              >
                <Icon className="h-4 w-4" strokeWidth={2.25} />
              </div>
              <span className="text-lg">{cfg.emoji}</span>
            </div>
            <div>
              <p className="font-display text-3xl font-black tracking-tight text-[var(--text-main)] sm:text-4xl">
                <AnimatedCounter
                  value={typeof value === "number" ? value : 0}
                  prefix={"prefix" in cfg ? cfg.prefix : ""}
                />
              </p>
              <p className="mt-1 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {cfg.label}
              </p>
              <p className={`mt-1 text-xs font-semibold ${style.delta}`}>
                {delta}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
