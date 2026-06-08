"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Crown, Flame } from "lucide-react";
import { ForecastPulseAnnotation } from "@/components/forecast/ForecastPulseAnnotation";
import { useActiveForecastMarkets } from "@/hooks/useForecastPulse";
import { useTopFlowerThisWeek } from "@/hooks/useIntelligenceRankings";
import { FORECAST_PULSE_ENABLED } from "@/lib/intelligence/featureFlags";
import { MovementBadge } from "./intelligence/MovementBadge";
import { SectionHeader } from "./intelligence/SectionHeader";

export function TopFlowerSection() {
  const rankings = useTopFlowerThisWeek();
  const forecastMarkets = useActiveForecastMarkets(10);
  const forecastByProduct = new Map(
    forecastMarkets
      .filter((m) => m.product_slug)
      .map((m) => [m.product_slug!, m.bullish_percent])
  );
  const featured = rankings[0];
  const carousel = rankings.slice(1);

  if (!featured) return null;

  return (
    <section aria-label="Top flower this week">
      <SectionHeader
        kicker="Weekly Rankings"
        title="Top Flower This Week"
        subtitle="Community-scored flower ranked by flavor, burn quality, and report volume."
        href="/leaderboards"
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <FeaturedCard
          entry={featured}
          bullishPercent={
            FORECAST_PULSE_ENABLED
              ? forecastByProduct.get(featured.product_slug)
              : undefined
          }
        />
        <div className="flex flex-col gap-2">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Top 10
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin lg:flex-col lg:overflow-visible">
            {carousel.map((entry, i) => (
              <CarouselRow
                key={entry.id}
                entry={entry}
                index={i}
                bullishPercent={
                  FORECAST_PULSE_ENABLED
                    ? forecastByProduct.get(entry.product_slug)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({
  entry,
  bullishPercent,
}: {
  entry: ReturnType<typeof useTopFlowerThisWeek>[number];
  bullishPercent?: number;
}) {
  return (
    <Link href={`/products/${entry.product_slug}`}>
      <motion.article
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="group relative h-full overflow-hidden rounded-xl border border-[#39FF88]/35 bg-gradient-to-br from-[#39FF88]/10 via-[var(--bg-card)] to-[var(--bg-card)] p-6 shadow-[0_0_40px_rgba(57,255,136,0.1)] transition hover:border-[#39FF88]/55"
      >
        <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFD23F]/15 text-[#FFD23F]">
          <Crown className="h-5 w-5" />
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#39FF88]/15 text-[#39FF88]">
          <Flame className="h-5 w-5" />
        </div>
        <p className="mt-4 font-display text-[10px] font-bold uppercase tracking-[0.25em] text-[#39FF88]">
          #1 This Week
        </p>
        <h3 className="mt-2 font-display text-3xl font-black uppercase tracking-tight text-[var(--text-main)] group-hover:text-[#39FF88]">
          {entry.product_name}
        </h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{entry.brand_name}</p>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="font-display text-5xl font-black tabular-nums text-[#39FF88]">
              {entry.score.toFixed(1)}
            </p>
            <p className="mt-1 font-display text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Community Score
            </p>
          </div>
          <div className="text-right">
            <MovementBadge movement={entry.movement} size="md" />
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              vs last week
            </p>
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              {entry.report_count} reports
              {entry.price_per_gram != null && ` · $${entry.price_per_gram}/g`}
            </p>
            {bullishPercent != null && (
              <ForecastPulseAnnotation
                bullishPercent={bullishPercent}
                className="mt-2"
              />
            )}
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

function CarouselRow({
  entry,
  index,
  bullishPercent,
}: {
  entry: ReturnType<typeof useTopFlowerThisWeek>[number];
  index: number;
  bullishPercent?: number;
}) {
  return (
    <Link
      href={`/products/${entry.product_slug}`}
      className="block min-w-[220px] lg:min-w-0"
    >
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.04 }}
        className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-card)] px-4 py-3 transition hover:border-[#39FF88]/30 hover:bg-[var(--surface-hover)]"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="font-display text-lg font-black tabular-nums text-[var(--text-muted)]">
            {entry.rank}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold uppercase text-[var(--text-main)]">
              {entry.product_name}
            </p>
            <p className="truncate text-xs text-[var(--text-muted)]">
              {entry.brand_name}
            </p>
            {bullishPercent != null && (
              <ForecastPulseAnnotation
                bullishPercent={bullishPercent}
                className="mt-0.5"
              />
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="font-display text-lg font-black tabular-nums text-[#39FF88]">
            {entry.score.toFixed(1)}
          </span>
          <MovementBadge movement={entry.movement} />
        </div>
      </motion.div>
    </Link>
  );
}
