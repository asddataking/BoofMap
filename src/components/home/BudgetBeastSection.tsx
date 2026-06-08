"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DollarSign, Trophy } from "lucide-react";
import { useValuePicks } from "@/hooks/useIntelligenceRankings";
import { MovementBadge } from "./intelligence/MovementBadge";
import { SectionHeader } from "./intelligence/SectionHeader";

export function BudgetBeastSection() {
  const picks = useValuePicks();

  return (
    <section aria-label="Budget beast rankings">
      <SectionHeader
        kicker="Value Intel"
        title="Budget Beast Rankings"
        subtitle="Best value products ranked by price-to-score ratio."
        href="/leaderboards"
      />

      <div className="overflow-hidden rounded-xl border border-[#FFD23F]/25 bg-gradient-to-br from-[#FFD23F]/5 to-[var(--bg-card)]">
        <div className="flex items-center gap-2 border-b border-[var(--border-soft)] px-4 py-3">
          <DollarSign className="h-4 w-4 text-[#FFD23F]" />
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-main)]">
            Price-to-Score Leaders
          </h3>
        </div>

        <div className="grid gap-px bg-[var(--border-soft)] sm:grid-cols-2 lg:grid-cols-4">
          {picks.map((pick, i) => (
            <Link
              key={pick.id}
              href={`/brands/${pick.brand_slug}`}
              className="block bg-[var(--bg-card)]"
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group flex h-full flex-col p-4 transition hover:bg-[var(--surface-hover)]"
              >
                <div className="flex items-start justify-between">
                  <span className="font-display text-2xl font-black text-[#FFD23F]/60">
                    {pick.rank}
                  </span>
                  {pick.rank === 1 && (
                    <Trophy className="h-4 w-4 text-[#FFD23F]" />
                  )}
                </div>
                <h4 className="mt-2 font-display text-base font-bold uppercase leading-tight text-[var(--text-main)] group-hover:text-[#FFD23F]">
                  {pick.product_name}
                </h4>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {pick.brand_name}
                </p>
                <div className="mt-auto flex items-end justify-between pt-4">
                  <div>
                    <p className="font-display text-xl font-black tabular-nums text-[#39FF88]">
                      {pick.score.toFixed(1)}
                    </p>
                    {pick.price_per_gram != null && (
                      <p className="text-[10px] font-semibold text-[#FFD23F]">
                        ${pick.price_per_gram}/g
                      </p>
                    )}
                  </div>
                  <MovementBadge movement={pick.movement} />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
