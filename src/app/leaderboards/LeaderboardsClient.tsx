"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { PageTransition } from "@/components/PageTransition";
import { LeaderboardCard } from "@/components/intelligence/cards/LeaderboardCard";
import { IntelGridOverlay } from "@/components/intelligence/IntelGridOverlay";
import { LEADERBOARD_CATEGORIES } from "@/lib/intelligence/constants";
import { useLeaderboard } from "@/hooks/useIntelligenceData";
import type { LeaderboardCategory } from "@/lib/intelligence/types";
import { slugify } from "@/lib/utils";

export function LeaderboardsClient() {
  const [active, setActive] = useState<LeaderboardCategory>("top_fire_products");
  const board = useLeaderboard(active);
  const config = LEADERBOARD_CATEGORIES.find((c) => c.id === active)!;

  return (
    <AppShell variant="landing">
      <PageTransition>
        <div className="space-y-10 pb-12 pt-4">
          <section className="relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-8">
            <IntelGridOverlay />
            <div className="relative">
              <p className="section-kicker">Live Rankings</p>
              <h1 className="font-display text-4xl font-black uppercase tracking-tight text-[var(--text-main)] sm:text-5xl">
                Leaderboards
              </h1>
              <p className="mt-3 max-w-xl text-sm text-[var(--text-muted)]">
                Community-powered rankings. Updated continuously from reports.
                Dispensaries cannot pay to be cool.
              </p>
            </div>
          </section>

          <div
            role="tablist"
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
          >
            {LEADERBOARD_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={active === cat.id}
                onClick={() => setActive(cat.id)}
                className={`shrink-0 rounded-lg border px-3 py-2 font-display text-xs font-bold uppercase tracking-wide transition sm:text-sm ${
                  active === cat.id
                    ? "border-[#39FF88]/50 bg-[#39FF88]/12 text-[#39FF88]"
                    : "border-[var(--border-soft)] bg-[var(--bg-panel)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          <motion.section
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-[var(--text-main)]">
                {config.emoji} {config.label}
              </h2>
              {board?.updated_at && (
                <span className="text-[10px] text-[var(--text-muted)]">
                  Updated {new Date(board.updated_at).toLocaleString()}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {board?.entries?.length ? (
                board.entries.map((entry, i) => (
                  <LeaderboardCard
                    key={`${entry.name}-${entry.rank}`}
                    rank={entry.rank}
                    name={entry.name}
                    subtitle={entry.subtitle}
                    score={entry.score}
                    movement={entry.movement}
                    href={
                      entry.slug
                        ? `/brands/${entry.slug}`
                        : `/brands/${slugify(entry.name)}`
                    }
                    index={i}
                  />
                ))
              ) : (
                <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                  Rankings populate as community reports roll in.
                </p>
              )}
            </div>
          </motion.section>
        </div>
      </PageTransition>
    </AppShell>
  );
}
