"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { IntelSignalCard, type IntelCardSignal } from "./IntelSignalCard";
import { useMarketMovers, useRankingsByType } from "@/hooks/useHomeData";
import { getMarkerTier } from "@/lib/markers";
import type { MeetupReport, RankingEntry, RankingType, Report } from "@/lib/types";
import { formatTimeAgo, slugify } from "@/lib/utils";

type BoardTab = "trending" | "fire" | "boof" | "value" | "fresh";

type TabConfig = {
  id: BoardTab;
  label: string;
  variant: "fire" | "boof" | "neutral";
  rankingType?: RankingType;
};

const TABS: TabConfig[] = [
  { id: "trending", label: "📈 Trending", variant: "fire" },
  { id: "fire", label: "🔥 Fire", variant: "fire", rankingType: "fire_right_now" },
  { id: "boof", label: "🚨 Boof", variant: "boof", rankingType: "biggest_fallers" },
  { id: "value", label: "💰 Best Value", variant: "neutral", rankingType: "budget_bargers" },
  { id: "fresh", label: "✨ Fresh", variant: "neutral" },
];

const DEMO_TRENDING: IntelCardSignal[] = [
  {
    id: "demo-runtz",
    name: "Local Grove Runtz",
    subtitle: "Flower · 48 reports",
    score: 4.8,
    change: 12,
    kind: "fire",
    href: "/brands/local-grove",
  },
  {
    id: "demo-frosted",
    name: "Peninsula Gardens Frosted Kush",
    subtitle: "Flower · 31 reports",
    score: 4.6,
    change: 7,
    kind: "fire",
  },
  {
    id: "demo-hytek",
    name: "Hytek Lemon Cherry Gelato",
    subtitle: "Cart · 22 reports",
    score: 3.2,
    change: -5,
    kind: "mid",
  },
  {
    id: "demo-fake",
    name: "Unknown Brand Fake Cart",
    subtitle: "Cart · 19 reports",
    score: 1.4,
    change: -8,
    kind: "boof",
  },
];

function rankingToSignal(entry: RankingEntry, index: number): IntelCardSignal {
  const tier =
    entry.score >= 4 ? "fire" : entry.score <= 2.5 ? "boof" : "mid";
  return {
    id: entry.id,
    href:
      entry.kind === "brand" && entry.slug
        ? `/brands/${entry.slug}`
        : entry.kind === "dispensary" && entry.slug
          ? `/dispensaries/${entry.slug}`
          : undefined,
    rank: entry.rank || index + 1,
    name: entry.name,
    subtitle: entry.subtitle ?? "",
    score: entry.score,
    change: entry.change,
    kind: tier,
  };
}

function reportToSignal(report: Report, index: number): IntelCardSignal {
  const tier = getMarkerTier(report);
  return {
    id: report.id,
    href: `/brands/${slugify(report.brand_name)}`,
    rank: index + 1,
    name: report.strain_name,
    subtitle: `${report.brand_name} · ${report.dispensary_name}`,
    score: report.boof_score,
    imageUrl: report.image_url,
    issueTags: report.issue_tags,
    kind: tier === "taxed" ? "mid" : tier,
    meta: `${report.city}, MI · ${formatTimeAgo(report.created_at)}`,
  };
}

function meetupToSignal(meetup: MeetupReport, index: number): IntelCardSignal {
  return {
    id: meetup.id,
    rank: index + 1,
    name: meetup.seller_display_name,
    subtitle: `${meetup.platform} · ${meetup.city}, MI`,
    score: meetup.seller_signal === "red" ? 1.5 : meetup.seller_signal === "orange" ? 2.5 : 3,
    kind: "meetup",
    meta: formatTimeAgo(meetup.created_at),
  };
}

export function IntelBoard({
  reports,
  meetups = [],
}: {
  reports: Report[];
  meetups?: MeetupReport[];
}) {
  const [activeTab, setActiveTab] = useState<BoardTab>("trending");
  const tablistId = useId();
  const panelId = useId();
  const { trending, falling } = useMarketMovers();
  const fireRankings = useRankingsByType("fire_right_now");
  const boofRankings = useRankingsByType("biggest_fallers");
  const valueRankings = useRankingsByType("budget_bargers");

  const activeConfig = TABS.find((t) => t.id === activeTab)!;

  const signals = useMemo((): IntelCardSignal[] => {
    switch (activeTab) {
      case "trending": {
        const movers = [...trending, ...falling].map((m, i) => ({
          id: m.id,
          href: m.slug ? `/brands/${m.slug}` : `/brands/${slugify(m.name)}`,
          rank: i + 1,
          name: m.name,
          subtitle: m.subtitle,
          score: m.score,
          change: m.change,
          kind: (m.change >= 0 ? "fire" : "boof") as IntelCardSignal["kind"],
        }));
        return movers.length >= 2 ? movers : DEMO_TRENDING;
      }
      case "fire":
        return fireRankings.map(rankingToSignal);
      case "boof":
        return boofRankings.map(rankingToSignal);
      case "value":
        return valueRankings.map(rankingToSignal);
      case "fresh": {
        const fromReports = reports.slice(0, 8).map(reportToSignal);
        const fromMeetups = meetups
          .slice(0, 3)
          .map((m, i) => meetupToSignal(m, fromReports.length + i));
        return [...fromReports, ...fromMeetups];
      }
      default:
        return [];
    }
  }, [
    activeTab,
    trending,
    falling,
    fireRankings,
    boofRankings,
    valueRankings,
    reports,
    meetups,
  ]);

  return (
    <section id="reports" className="scroll-mt-24" aria-label="Live intel board">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39FF88] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#39FF88]" />
            </span>
            <p className="section-kicker !mb-0">Live Intel</p>
          </div>
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[var(--text-main)] sm:text-3xl">
            Michigan Signals
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Trending brands, fire finds, boof alerts, and fresh community reports
          </p>
        </div>
        <Link
          href="/reports"
          className="group hidden shrink-0 items-center gap-1 text-sm font-semibold text-[#39FF88] sm:inline-flex"
        >
          View all reports
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div
        role="tablist"
        aria-label="Filter intel signals"
        className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
      >
        {TABS.map((tab) => {
          const selected = activeTab === tab.id;
          const fireActive = selected && tab.variant === "fire";
          const boofActive = selected && tab.variant === "boof";
          const tabBtnId = `${tablistId}-${tab.id}`;
          return (
            <button
              key={tab.id}
              id={tabBtnId}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              onClick={() => setActiveTab(tab.id)}
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

      <p className="mt-3 text-xs text-[var(--text-muted)]">
        <span className="font-display font-bold uppercase tracking-wider text-[#39FF88]">
          {activeConfig.label.replace(/^[^\s]+\s/, "")}
        </span>
        {" · "}
        updated live from community intel
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          id={panelId}
          role="tabpanel"
          aria-labelledby={`${tablistId}-${activeTab}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-5"
        >
          {signals.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin lg:gap-4">
              {signals.map((signal, i) => (
                <IntelSignalCard
                  key={`${activeTab}-${signal.id}`}
                  signal={signal}
                  index={i}
                  featured={i === 0}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-10 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                No signals in this filter yet. Be the first to report.
              </p>
              <Link href="/report" className="btn-primary mt-4 inline-flex px-6 py-3">
                Report Boof
              </Link>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <Link
        href="/reports"
        className="btn-secondary mt-4 flex w-full items-center justify-center gap-2 sm:hidden"
      >
        View all reports
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
