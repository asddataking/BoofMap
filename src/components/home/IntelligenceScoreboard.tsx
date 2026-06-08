"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  DollarSign,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { FireCard } from "@/components/intelligence/cards/FireCard";
import { useScoreboardData, type ScoreboardTab } from "@/hooks/useScoreboardData";
import type { IntelligenceRankingEntry } from "@/lib/intelligence/types";
import { MovementBadge } from "./intelligence/MovementBadge";
import { SectionHeader } from "./intelligence/SectionHeader";

const TABS: {
  id: ScoreboardTab;
  label: string;
  shortLabel: string;
}[] = [
  { id: "movers", label: "Biggest Movers", shortLabel: "Movers" },
  { id: "falling", label: "Falling Products", shortLabel: "Falling" },
  { id: "hot-drops", label: "Hot Drops", shortLabel: "Hot" },
  { id: "value", label: "Budget Beast", shortLabel: "Value" },
  { id: "brands", label: "Brand Momentum", shortLabel: "Brands" },
];

export function IntelligenceScoreboard() {
  const data = useScoreboardData();
  const [activeTab, setActiveTab] = useState<ScoreboardTab>("movers");
  const tablistId = useId();

  const tabCounts: Record<ScoreboardTab, number> = {
    movers: data.movers.length,
    falling: data.falling.length,
    "hot-drops": data.hotDrops.length,
    value: data.value.length,
    brands: data.risingBrands.length + data.fallingBrands.length,
  };

  return (
    <section aria-label="Intelligence scoreboard">
      <SectionHeader
        kicker="Momentum Tracker"
        title="Intel Scoreboard"
        subtitle="Community-ranked movers, drops, value picks, and brand momentum — one live board."
        href="/leaderboards"
      />

      <div className="overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)]">
        <div
          role="tablist"
          aria-label="Scoreboard categories"
          className="flex gap-1 overflow-x-auto border-b border-[var(--border-soft)] bg-[var(--bg-panel)] p-2 scrollbar-thin"
        >
          {TABS.map((tab) => {
            const selected = activeTab === tab.id;
            const count = tabCounts[tab.id];
            return (
              <button
                key={tab.id}
                id={`${tablistId}-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${tablistId}-panel`}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-lg px-3 py-2 font-display text-[10px] font-bold uppercase tracking-[0.14em] transition sm:px-4 sm:text-xs ${
                  selected
                    ? "bg-[#39FF88]/15 text-[#39FF88] shadow-[inset_0_0_0_1px_rgba(57,255,136,0.35)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-main)]"
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                {count > 0 && (
                  <span
                    className={`ml-1.5 inline-flex min-w-[1.25rem] justify-center rounded-full px-1 text-[9px] tabular-nums ${
                      selected
                        ? "bg-[#39FF88]/20 text-[#39FF88]"
                        : "bg-[var(--border-soft)] text-[var(--text-muted)]"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            id={`${tablistId}-panel`}
            role="tabpanel"
            aria-labelledby={`${tablistId}-${activeTab}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="p-4 sm:p-5"
          >
            {activeTab === "movers" && (
              <RankingList
                items={data.movers}
                emptyMessage="Building momentum data…"
                accent="green"
              />
            )}
            {activeTab === "falling" && (
              <RankingList
                items={data.falling}
                emptyMessage="No declining products detected this week."
                accent="red"
              />
            )}
            {activeTab === "hot-drops" && (
              <HotDropsPanel items={data.hotDrops} />
            )}
            {activeTab === "value" && <ValuePanel items={data.value} />}
            {activeTab === "brands" && (
              <BrandsPanel
                rising={data.risingBrands}
                falling={data.fallingBrands}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function RankingList({
  items,
  emptyMessage,
  accent,
}: {
  items: IntelligenceRankingEntry[];
  emptyMessage: string;
  accent: "green" | "red";
}) {
  const accentBorder =
    accent === "green" ? "border-[#39FF88]/20" : "border-[#FF3B3B]/20";

  if (!items.length) {
    return (
      <p className="py-8 text-center text-xs text-[var(--text-muted)]">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className={`divide-y divide-[var(--border-soft)] rounded-lg border ${accentBorder}`}>
      {items.map((item, i) => (
        <motion.li
          key={item.id}
          initial={{ opacity: 0, x: accent === "green" ? -8 : 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <Link
            href={`/products/${item.product_slug}`}
            className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-[var(--surface-hover)]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="font-display text-sm font-black tabular-nums text-[var(--text-muted)]">
                {item.rank}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold uppercase text-[var(--text-main)]">
                  {item.product_name}
                </p>
                <p className="truncate text-xs text-[var(--text-muted)]">
                  {item.brand_name} · {item.report_count} reports
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="font-display text-lg font-black tabular-nums text-[var(--text-main)]">
                {item.score.toFixed(1)}
              </span>
              <MovementBadge movement={item.movement} />
            </div>
          </Link>
        </motion.li>
      ))}
    </ul>
  );
}

function HotDropsPanel({ items }: { items: IntelligenceRankingEntry[] }) {
  if (!items.length) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--border-soft)] p-6 text-sm text-[var(--text-muted)]">
        <Sparkles className="h-5 w-5 shrink-0 text-[#FFD23F]" />
        New drops appear as the community reports.
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-thin">
      {items.map((drop, i) => (
        <FireCard
          key={drop.id}
          name={drop.product_name}
          subtitle={drop.brand_name}
          score={drop.score}
          movement={drop.movement}
          href={`/products/${drop.product_slug}`}
          meta={`${drop.report_count} new reports`}
          index={i}
          featured={i === 0}
        />
      ))}
    </div>
  );
}

function ValuePanel({ items }: { items: IntelligenceRankingEntry[] }) {
  if (!items.length) {
    return (
      <p className="py-8 text-center text-xs text-[var(--text-muted)]">
        Value rankings need price + score reports.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#FFD23F]/25 bg-gradient-to-br from-[#FFD23F]/5 to-transparent">
      <div className="flex items-center gap-2 border-b border-[var(--border-soft)] px-4 py-3">
        <DollarSign className="h-4 w-4 text-[#FFD23F]" />
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-main)]">
          Price-to-Score Leaders
        </h3>
      </div>
      <div className="grid gap-px bg-[var(--border-soft)] sm:grid-cols-2 lg:grid-cols-4">
        {items.map((pick, i) => (
          <Link
            key={pick.id}
            href={`/products/${pick.product_slug}`}
            className="block bg-[var(--bg-card)]"
          >
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
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
  );
}

function BrandsPanel({
  rising,
  falling,
}: {
  rising: IntelligenceRankingEntry[];
  falling: IntelligenceRankingEntry[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <BrandColumn
        title="Rising Brands"
        icon={TrendingUp}
        accent="green"
        items={rising}
        emptyMessage="No rising brands this week."
      />
      <BrandColumn
        title="Falling Brands"
        icon={TrendingDown}
        accent="red"
        items={falling}
        emptyMessage="No falling brands this week."
        invertMovement
      />
    </div>
  );
}

function BrandColumn({
  title,
  icon: Icon,
  accent,
  items,
  emptyMessage,
  invertMovement = false,
}: {
  title: string;
  icon: typeof TrendingUp;
  accent: "green" | "red";
  items: IntelligenceRankingEntry[];
  emptyMessage: string;
  invertMovement?: boolean;
}) {
  const borderClass =
    accent === "green"
      ? "border-[#39FF88]/20 bg-[#39FF88]/5"
      : "border-[#FF3B3B]/20 bg-[#FF3B3B]/5";
  const iconClass = accent === "green" ? "text-[#39FF88]" : "text-[#FF3B3B]";

  return (
    <div className={`overflow-hidden rounded-lg border ${borderClass}`}>
      <div className="flex items-center gap-2 border-b border-[var(--border-soft)] px-4 py-3">
        <Icon className={`h-4 w-4 ${iconClass}`} />
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-main)]">
          {title}
        </h3>
      </div>
      <ul className="divide-y divide-[var(--border-soft)]">
        {!items.length ? (
          <li className="px-4 py-6 text-center text-xs text-[var(--text-muted)]">
            {emptyMessage}
          </li>
        ) : (
          items.map((item, i) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: accent === "green" ? -8 : 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/brands/${item.brand_slug}`}
                className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-[var(--surface-hover)]"
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold uppercase text-[var(--text-main)]">
                    {item.brand_name}
                  </p>
                  <p className="truncate text-xs text-[var(--text-muted)]">
                    {item.report_count} reports
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-display text-lg font-black tabular-nums text-[var(--text-main)]">
                    {item.score.toFixed(1)}
                  </span>
                  <MovementBadge
                    movement={
                      invertMovement ? -item.movement : item.movement
                    }
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
