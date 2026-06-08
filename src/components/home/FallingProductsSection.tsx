"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingDown } from "lucide-react";
import { useFallingProducts } from "@/hooks/useIntelligenceRankings";
import { MovementBadge } from "./intelligence/MovementBadge";
import { SectionHeader } from "./intelligence/SectionHeader";

export function FallingProductsSection() {
  const falling = useFallingProducts();

  return (
    <section aria-label="Falling products">
      <SectionHeader
        kicker="Momentum Tracker"
        title="Falling Products"
        subtitle="Products losing score momentum this week — community signals trending down."
      />

      <div className="overflow-hidden rounded-xl border border-[#FF3B3B]/25 bg-gradient-to-br from-[#FF3B3B]/5 to-[var(--bg-card)]">
        <div className="flex items-center gap-2 border-b border-[var(--border-soft)] px-4 py-3">
          <TrendingDown className="h-4 w-4 text-[#FF3B3B]" />
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-main)]">
            Score Decline
          </h3>
        </div>

        <ul className="divide-y divide-[var(--border-soft)]">
          {falling.length === 0 ? (
            <li className="px-4 py-6 text-center text-xs text-[var(--text-muted)]">
              No declining products detected this week.
            </li>
          ) : (
            falling.map((item, i) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: 8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/products/${item.product_slug}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-[var(--surface-hover)]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-bold uppercase text-[var(--text-main)]">
                      {item.product_name}
                    </p>
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {item.brand_name} · {item.report_count} reports
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-display text-lg font-black tabular-nums text-[var(--text-main)]">
                      {item.score.toFixed(1)}
                    </span>
                    <MovementBadge movement={item.movement} />
                  </div>
                </Link>
              </motion.li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
