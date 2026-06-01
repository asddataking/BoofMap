"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import type { RankingEntry } from "@/lib/types";

export function RankingCard({
  entry,
  index = 0,
}: {
  entry: RankingEntry;
  index?: number;
}) {
  const change = entry.change ?? 0;
  const href =
    entry.kind === "brand" && entry.slug
      ? `/brands/${entry.slug}`
      : entry.kind === "dispensary" && entry.slug
        ? `/dispensaries/${entry.slug}`
        : undefined;

  const inner = (
    <>
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#39FF88]/20 bg-[var(--bg-panel)] font-display text-sm font-extrabold text-[#39FF88]">
          {entry.rank}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold text-[var(--text-main)]">
            {entry.name}
          </p>
          {entry.subtitle && (
            <p className="truncate text-xs text-zinc-500">{entry.subtitle}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-end justify-between gap-2">
        <div>
          <p className="font-display text-2xl font-black tabular-nums text-[var(--text-main)]">
            {entry.score.toFixed(1)}
          </p>
          <p className="font-display text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Intel Score
          </p>
        </div>
        <ChangeIndicator change={change} />
      </div>
    </>
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="glass-card min-w-[200px] shrink-0 p-4 transition hover:border-[#39FF88]/30 sm:min-w-[220px]"
    >
      {href ? (
        <Link href={href} className="block">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </motion.article>
  );
}

function ChangeIndicator({ change }: { change: number }) {
  if (Math.abs(change) < 0.05) {
    return (
      <span className="flex items-center gap-0.5 text-xs font-semibold text-zinc-500">
        <Minus className="h-3 w-3" />
        0.0
      </span>
    );
  }
  const up = change > 0;
  return (
    <span
      className={`flex items-center gap-0.5 text-xs font-bold ${up ? "text-emerald-400" : "text-red-400"}`}
    >
      {up ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
      {Math.abs(change).toFixed(1)}
    </span>
  );
}
