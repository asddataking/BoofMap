"use client";

import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { PageTransition } from "@/components/PageTransition";
import { MarketCard } from "@/components/intelligence/cards/MarketCard";
import { IntelGridOverlay } from "@/components/intelligence/IntelGridOverlay";
import { TrendSparkline } from "@/components/intelligence/TrendSparkline";
import { useMarketReport, useMarketStatus } from "@/hooks/useIntelligenceData";

const TREND_DATA = [
  { label: "Mon", value: 12 },
  { label: "Tue", value: 18 },
  { label: "Wed", value: 15 },
  { label: "Thu", value: 22 },
  { label: "Fri", value: 28 },
  { label: "Sat", value: 24 },
  { label: "Sun", value: 31 },
];

export function StateOfMarketClient() {
  const report = useMarketReport("MI");
  const status = useMarketStatus("MI");

  const metrics = report
    ? [
        {
          label: "Most Improved Brand",
          value: report.most_improved_brand,
          emoji: "📈",
          status: "positive" as const,
        },
        {
          label: "Most Trusted Brand",
          value: report.most_trusted_brand,
          emoji: "🛡",
          status: "positive" as const,
        },
        {
          label: "Hottest Product",
          value: report.hottest_product,
          emoji: "🔥",
          status: "positive" as const,
        },
        {
          label: "Most Active City",
          value: report.most_active_city,
          emoji: "📍",
          status: "neutral" as const,
        },
        {
          label: "Best Value Product",
          value: report.best_value_product,
          emoji: "💰",
          status: "neutral" as const,
        },
        {
          label: "Biggest Boof Alert",
          value: report.biggest_boof_alert,
          emoji: "🚨",
          status: "negative" as const,
        },
      ]
    : [];

  return (
    <AppShell variant="landing">
      <PageTransition>
        <div className="space-y-12 pb-12 pt-4">
          <section className="relative overflow-hidden rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-8 lg:p-10">
            <IntelGridOverlay />
            <div className="relative">
              <p className="section-kicker">Weekly Intelligence</p>
              <h1 className="font-display text-4xl font-black uppercase tracking-tight text-[var(--text-main)] sm:text-5xl">
                State of the Market
              </h1>
              {report && (
                <p className="mt-3 text-sm text-[var(--text-muted)]">
                  Week of {report.week_start} — {report.week_end} ·{" "}
                  {report.state}
                </p>
              )}
              <p className="mt-4 max-w-2xl text-base text-[var(--text-muted)]">
                Generated from community detections. Snapshots stored in Convex.
                Updated weekly with market intelligence you won&apos;t find on
                pay-to-play directories.
              </p>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {metrics.map((m, i) => (
              <MarketCard key={m.label} {...m} index={i} />
            ))}
          </section>

          <section className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-6">
            <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-[var(--text-main)]">
              Fire Signal Trend — 7 Day
            </h2>
            <div className="mt-4">
              <TrendSparkline data={TREND_DATA} color="#39FF88" height={120} />
            </div>
            <p className="mt-3 text-xs text-[var(--text-muted)]">
              {status.fire_reports_rising
                ? `Fire reports rising +${status.fire_trend_pct}% this week`
                : "Fire reports holding steady"}
              {" · "}
              {status.new_boof_alerts} new boof alerts · {status.batch_warnings}{" "}
              batch warnings
            </p>
          </section>
        </div>
      </PageTransition>
    </AppShell>
  );
}
