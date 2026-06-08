"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import {
  useBiggestMovers,
  useFallingBrands,
  useRisingBrands,
} from "@/hooks/useIntelligenceRankings";
import { MovementBadge } from "./intelligence/MovementBadge";
import { SectionHeader } from "./intelligence/SectionHeader";

export function BiggestMoversSection() {
  const movers = useBiggestMovers();
  const rising = useRisingBrands();
  const falling = useFallingBrands();

  return (
    <section aria-label="Biggest movers">
      <SectionHeader
        kicker="Momentum Tracker"
        title="Biggest Movers"
        subtitle="Products gaining score momentum this week — up and down."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <MoverPanel
          title="Score Momentum"
          icon={TrendingUp}
          accent="green"
          items={movers}
        />
        <MoverPanel
          title="Rising Brands"
          icon={TrendingUp}
          accent="green"
          items={rising}
          brandMode
        />
        <MoverPanel
          title="Falling Brands"
          icon={TrendingUp}
          accent="red"
          items={falling}
          brandMode
          invertMovement
        />
      </div>
    </section>
  );
}

function MoverPanel({
  title,
  icon: Icon,
  accent,
  items,
  brandMode = false,
  invertMovement = false,
}: {
  title: string;
  icon: typeof TrendingUp;
  accent: "green" | "red";
  items: ReturnType<typeof useBiggestMovers>;
  brandMode?: boolean;
  invertMovement?: boolean;
}) {
  const borderClass =
    accent === "green"
      ? "border-[#39FF88]/20 bg-[#39FF88]/5"
      : "border-[#FF3B3B]/20 bg-[#FF3B3B]/5";
  const iconClass = accent === "green" ? "text-[#39FF88]" : "text-[#FF3B3B]";

  return (
    <div className={`overflow-hidden rounded-xl border ${borderClass}`}>
      <div className="flex items-center gap-2 border-b border-[var(--border-soft)] px-4 py-3">
        <Icon className={`h-4 w-4 ${iconClass}`} />
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-main)]">
          {title}
        </h3>
      </div>
      <ul className="divide-y divide-[var(--border-soft)]">
        {items.length === 0 ? (
          <li className="px-4 py-6 text-center text-xs text-[var(--text-muted)]">
            Building momentum data…
          </li>
        ) : (
          items.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: accent === "green" ? -8 : 8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/brands/${item.brand_slug}`}
                className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-[var(--surface-hover)]"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold uppercase text-[var(--text-main)]">
                    {brandMode ? item.brand_name : item.product_name}
                  </p>
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    {brandMode
                      ? `${item.report_count} reports`
                      : `${item.brand_name} · ${item.report_count} reports`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-display text-lg font-black tabular-nums text-[var(--text-main)]">
                    {item.score.toFixed(1)}
                  </span>
                  <MovementBadge
                    movement={invertMovement ? -item.movement : item.movement}
                  />
                </div>
              </Link>
            </motion.li>
          ))
        )}
      </ul>
    </div>
  );
}
