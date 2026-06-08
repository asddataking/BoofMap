"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp } from "lucide-react";
import { useMarketMovers } from "@/hooks/useHomeData";
import { slugify } from "@/lib/utils";

export function MarketMovers() {
  const { trending, falling } = useMarketMovers();

  return (
    <section aria-label="Market movers">
      <div className="mb-5">
        <p className="font-heading text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-500">
          Market Watch
        </p>
        <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          Trending &amp; Falling
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MoverPanel
          title="Trending Up"
          icon={TrendingUp}
          accent="emerald"
          items={trending}
        />
        <MoverPanel
          title="Biggest Fallers"
          icon={TrendingDown}
          accent="red"
          items={falling}
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
}: {
  title: string;
  icon: typeof TrendingUp;
  accent: "emerald" | "red";
  items: {
    id: string;
    name: string;
    subtitle: string;
    score: number;
    change: number;
    slug?: string;
  }[];
}) {
  const accentClasses =
    accent === "emerald"
      ? "border-emerald-500/20 bg-emerald-500/5"
      : "border-red-500/20 bg-red-500/5";
  const iconClass = accent === "emerald" ? "text-emerald-400" : "text-red-400";

  return (
    <div className={`glass-card overflow-hidden border ${accentClasses}`}>
      <div className="flex items-center gap-2 border-b border-[var(--border-soft)] px-4 py-3">
        <Icon className={`h-4 w-4 ${iconClass}`} />
        <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
          {title}
        </h3>
      </div>
      <ul className="divide-y divide-zinc-800/60">
        {items.map((item, i) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: accent === "emerald" ? -8 : 8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={item.slug ? `/brands/${item.slug}` : `/brands/${slugify(item.name)}`}
              className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-[var(--surface-hover)]"
            >
              <div className="min-w-0">
                <p className="truncate font-heading text-sm font-semibold text-white">
                  {item.name}
                </p>
                <p className="truncate text-xs text-[var(--text-muted)]">{item.subtitle}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-heading text-lg font-bold tabular-nums text-white">
                  {item.score.toFixed(1)}
                </span>
                <span
                  className={`flex items-center gap-0.5 text-xs font-bold ${
                    item.change >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {item.change >= 0 ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  {Math.abs(item.change).toFixed(1)}
                </span>
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
