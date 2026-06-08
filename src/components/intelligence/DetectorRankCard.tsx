"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { DETECTOR_RANKS } from "@/lib/intelligence/constants";
import type { DetectorRank } from "@/lib/intelligence/types";

export function DetectorRankCard({
  rank,
  currentPoints,
  isCurrent = false,
  index = 0,
}: {
  rank: (typeof DETECTOR_RANKS)[number];
  currentPoints: number;
  isCurrent?: boolean;
  index?: number;
}) {
  const unlocked = currentPoints >= rank.minPoints;
  const isNext =
    !isCurrent &&
    currentPoints < rank.minPoints &&
    DETECTOR_RANKS.findIndex((r) => r.id === rank.id) ===
      DETECTOR_RANKS.findIndex(
        (r) => currentPoints >= r.minPoints
      ) + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className={`relative overflow-hidden rounded-xl border p-5 transition ${
        isCurrent
          ? "border-[#39FF88]/50 bg-gradient-to-br from-[#39FF88]/12 via-[var(--bg-card)] to-[var(--bg-card)] shadow-[0_0_40px_rgba(57,255,136,0.12)]"
          : unlocked
            ? "border-[var(--border-soft)] bg-[var(--bg-card)] opacity-90"
            : "border-[var(--border-soft)] bg-[var(--bg-panel)]/50 opacity-60"
      }`}
    >
      {isCurrent && (
        <div className="absolute right-3 top-3 rounded-md bg-[#39FF88]/15 px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider text-[#39FF88]">
          Current Rank
        </div>
      )}

      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl ${
            isCurrent
              ? "bg-[#39FF88]/20 shadow-[0_0_24px_rgba(57,255,136,0.3)]"
              : "bg-[var(--bg-panel)]"
          }`}
        >
          {rank.badge}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Rank {DETECTOR_RANKS.findIndex((r) => r.id === rank.id) + 1}
          </p>
          <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-[var(--text-main)]">
            {rank.label}
          </h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {rank.minPoints.toLocaleString()}+ detection points
          </p>

          {isCurrent && (
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-panel)]">
                <motion.div
                  className="h-full rounded-full bg-[#39FF88]"
                  initial={{ width: 0 }}
                  whileInView={{ width: "var(--progress)" }}
                  viewport={{ once: true }}
                  style={
                    {
                      "--progress": `${Math.min(100, ((currentPoints - rank.minPoints) / Math.max(1, (DETECTOR_RANKS[DETECTOR_RANKS.findIndex((r) => r.id === rank.id) + 1]?.minPoints ?? rank.minPoints + 500) - rank.minPoints)) * 100)}%`,
                    } as CSSProperties
                  }
                />
              </div>
            </div>
          )}

          <ul className="mt-3 space-y-1">
            {rank.unlocks.map((u) => (
              <li
                key={u}
                className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]"
              >
                <span className={unlocked ? "text-[#39FF88]" : "text-[var(--text-muted)]/50"}>
                  {unlocked ? "✓" : "○"}
                </span>
                {u}
              </li>
            ))}
          </ul>

          {isNext && (
            <p className="mt-2 text-[10px] font-semibold text-[#FFD23F]">
              {(rank.minPoints - currentPoints).toLocaleString()} pts to unlock
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function rankIdFromPoints(points: number): DetectorRank {
  const ranks = [...DETECTOR_RANKS].reverse();
  for (const r of ranks) {
    if (points >= r.minPoints) return r.id;
  }
  return "observer";
}
