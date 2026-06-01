"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useMarketMovers } from "@/hooks/useHomeData";
import { boofScoreToIntel, intelVerdictFromBoofScore } from "@/lib/intelScore";
import { slugify } from "@/lib/utils";

type TrendItem = {
  id: string;
  name: string;
  subtitle: string;
  score: number;
  change: number;
  slug?: string;
};

const DEMO_TRENDING: TrendItem[] = [
  {
    id: "demo-runtz",
    name: "Local Grove Runtz",
    subtitle: "Flower · 48 reports",
    score: 4.8,
    change: 12,
  },
  {
    id: "demo-frosted",
    name: "Peninsula Gardens Frosted Kush",
    subtitle: "Flower · 31 reports",
    score: 4.6,
    change: 7,
  },
  {
    id: "demo-hytek",
    name: "Hytek Lemon Cherry Gelato",
    subtitle: "Cart · 22 reports",
    score: 3.2,
    change: -5,
  },
  {
    id: "demo-fake",
    name: "Unknown Brand Fake Cart",
    subtitle: "Cart · 19 reports",
    score: 1.4,
    change: -8,
  },
];

function verdictBadge(score: number) {
  const v = intelVerdictFromBoofScore(score);
  const styles = {
    FIRE: "border-[#39FF88]/50 bg-[#39FF88]/10 text-[#39FF88]",
    SOLID: "border-[#9AC434]/50 bg-[#9AC434]/10 text-[#9AC434]",
    MID: "border-[#FFD23F]/50 bg-[#FFD23F]/10 text-[#FFD23F]",
    BOOF: "border-[#FF3B3B]/50 bg-[#FF3B3B]/10 text-[#FF3B3B]",
  };
  const label =
    v === "SOLID" ? "SOLID" : v === "FIRE" ? "FIRE" : v === "MID" ? "MID" : "BOOF";
  return (
    <span
      className={`font-display shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[v]}`}
    >
      {label}
    </span>
  );
}

export function TrendingNow() {
  const { trending, falling } = useMarketMovers();
  const fromData = [...trending, ...falling].slice(0, 6);
  const items: TrendItem[] =
    fromData.length >= 2
      ? fromData.map((m) => ({
          id: m.id,
          name: m.name,
          subtitle: m.subtitle,
          score: m.score,
          change: m.change,
          slug: m.slug,
        }))
      : DEMO_TRENDING;

  return (
    <section aria-label="Trending now">
      <div className="mb-5">
        <p className="section-kicker">Live Intel</p>
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[var(--text-main)] sm:text-3xl">
          Trending Now
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Community signals moving fastest — fire finds and boof alerts
        </p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {items.map((item, i) => (
          <TrendCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}

function TrendCard({ item, index }: { item: TrendItem; index: number }) {
  const intel = boofScoreToIntel(item.score);
  const up = item.change >= 0;
  const href = item.slug
    ? `/brands/${item.slug}`
    : `/brands/${slugify(item.name.split(" ")[0] ?? item.name)}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="flex min-w-[240px] shrink-0 flex-col rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-4 transition hover:border-[#39FF88]/30 sm:min-w-[260px]"
    >
      <div className="mb-3 flex h-14 w-full items-center justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--bg-panel)]">
        <span className="font-display text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          Intel preview
        </span>
      </div>

      <Link href={href} className="group flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-sm font-bold leading-snug text-[var(--text-main)] group-hover:text-[#39FF88]">
            {item.name}
          </p>
          {verdictBadge(item.score)}
        </div>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{item.subtitle}</p>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="font-display text-2xl font-black tabular-nums text-white">
              {intel}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Intel score
            </p>
          </div>
          <span
            className={`flex items-center gap-0.5 font-display text-sm font-bold ${up ? "text-[#39FF88]" : "text-[#FF3B3B]"}`}
          >
            {up ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
            {up ? "+" : ""}
            {item.change}
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
