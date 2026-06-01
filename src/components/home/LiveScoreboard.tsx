"use client";

import { useState } from "react";
import { Flame, ShieldAlert, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { useRankingsByType } from "@/hooks/useHomeData";
import type { RankingType } from "@/lib/types";
import { RankingCard } from "./RankingCard";

const TABS: {
  type: RankingType;
  label: string;
  icon: typeof Flame;
}[] = [
  { type: "fire_right_now", label: "Fire Right Now", icon: Flame },
  { type: "biggest_fallers", label: "Biggest Fallers", icon: TrendingDown },
  { type: "most_reported", label: "Most Reported", icon: BarChart3 },
  { type: "budget_bargers", label: "Budget Ballers", icon: DollarSign },
  { type: "fraud_watch", label: "Fraud Watch", icon: ShieldAlert },
];

export function LiveScoreboard() {
  const [active, setActive] = useState<RankingType>("fire_right_now");
  const rankings = useRankingsByType(active);
  const activeTab = TABS.find((t) => t.type === active)!;

  return (
    <section aria-label="Live scoreboard">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker">Live Rankings</p>
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
            BoofMap Scoreboard
          </h2>
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {TABS.map(({ type, label, icon: Icon }) => {
          const selected = active === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setActive(type)}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                selected
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                  : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
        <activeTab.icon className="h-3.5 w-3.5 text-emerald-500" />
        <span>{activeTab.label} — updated live from community reports</span>
      </div>

      <div className="mt-5 flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {rankings.length > 0 ? (
          rankings.map((entry, i) => (
            <RankingCard key={entry.id} entry={entry} index={i} />
          ))
        ) : (
          <div className="glass-card w-full p-8 text-center">
            <p className="text-sm text-zinc-500">No rankings in this category yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
