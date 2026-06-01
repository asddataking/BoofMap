"use client";

import { useState } from "react";
import { useRankingsByType } from "@/hooks/useHomeData";
import type { RankingType } from "@/lib/types";
import { RankingCard } from "./RankingCard";

type TabConfig = {
  id: string;
  type: RankingType;
  label: string;
  variant: "fire" | "boof" | "neutral";
};

const TABS: TabConfig[] = [
  { id: "fire", type: "fire_right_now", label: "🔥 Fire Right Now", variant: "fire" },
  { id: "trending", type: "fire_right_now", label: "📈 Trending Up", variant: "fire" },
  { id: "value", type: "budget_bargers", label: "💰 Best Value", variant: "fire" },
  { id: "community", type: "most_reported", label: "🛡 Community Lock", variant: "neutral" },
  {
    id: "boof",
    type: "biggest_fallers",
    label: "🚨 Most Reported Boof",
    variant: "boof",
  },
  { id: "fraud", type: "fraud_watch", label: "💀 Fraud Alerts", variant: "boof" },
  { id: "taxed", type: "most_reported", label: "📊 Most Taxed", variant: "boof" },
];

export function LiveScoreboard() {
  const [activeId, setActiveId] = useState(TABS[0]!.id);
  const activeTab = TABS.find((t) => t.id === activeId) ?? TABS[0]!;
  const rankings = useRankingsByType(activeTab.type);

  return (
    <section aria-label="Browse intel">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Browse Intel</p>
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[var(--text-main)] sm:text-3xl">
            Live Rankings
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Sportsbook-style filters on community signals
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {TABS.map((tab) => {
          const selected = activeId === tab.id;
          const fireActive = selected && tab.variant === "fire";
          const boofActive = selected && tab.variant === "boof";
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveId(tab.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 font-display text-xs font-bold uppercase tracking-wide transition sm:text-sm ${
                fireActive
                  ? "border-[#39FF88]/50 bg-[#39FF88]/12 text-[#39FF88] shadow-[0_0_20px_rgba(57,255,136,0.15)]"
                  : boofActive
                    ? "border-[#FF3B3B]/50 bg-[#FF3B3B]/12 text-[#FF3B3B] shadow-[0_0_20px_rgba(255,59,59,0.12)]"
                    : selected
                      ? "border-white/20 bg-[var(--bg-card)] text-[var(--text-main)]"
                      : "border-[var(--border-soft)] bg-[var(--bg-panel)] text-[var(--text-muted)] hover:border-white/15 hover:text-[var(--text-main)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <span className="font-display font-bold uppercase tracking-wider text-[#39FF88]">
          {activeTab.label.replace(/^[^\s]+\s/, "")}
        </span>
        <span>— live community intel</span>
      </div>

      <div className="mt-5 flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {rankings.length > 0 ? (
          rankings.map((entry, i) => (
            <RankingCard key={`${activeTab.id}-${entry.id}`} entry={entry} index={i} />
          ))
        ) : (
          <div className="glass-card w-full p-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">
              No signals in this filter yet. Drop the first report.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
