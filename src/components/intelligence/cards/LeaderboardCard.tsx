"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";

export function LeaderboardCard({
  rank,
  name,
  subtitle,
  score,
  movement,
  href,
  emoji,
  index = 0,
}: {
  rank: number;
  name: string;
  subtitle?: string;
  score: number;
  movement: number;
  href?: string;
  emoji?: string;
  index?: number;
}) {
  const rising = movement >= 0;

  const inner = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-panel)]/80 px-3 py-2.5 transition hover:border-[#39FF88]/25 hover:bg-[var(--bg-card)]"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--bg-card)] font-display text-sm font-black text-[var(--text-muted)]">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-bold uppercase tracking-tight text-[var(--text-main)]">
          {emoji && <span className="mr-1">{emoji}</span>}
          {name}
        </p>
        {subtitle && (
          <p className="truncate text-[10px] text-[var(--text-muted)]">
            {subtitle}
          </p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className="font-display text-sm font-black tabular-nums text-[#39FF88]">
          {score.toFixed(1)}
        </p>
        <p
          className={`flex items-center justify-end gap-0.5 text-[10px] font-semibold ${
            rising ? "text-[#39FF88]" : "text-[#FF3B3B]"
          }`}
        >
          {rising ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {rising ? "+" : ""}
          {movement}
        </p>
      </div>
    </motion.div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}
