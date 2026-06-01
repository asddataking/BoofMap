"use client";

import { useTickerItems } from "@/hooks/useHomeData";
import type { TickerItemType } from "@/lib/types";

const typeStyles: Record<TickerItemType, string> = {
  fire: "text-emerald-400",
  alert: "text-red-400",
  warning: "text-orange-400",
  ranking: "text-amber-400",
  fresh_drop: "text-cyan-400",
};

function tickerLabel(item: {
  type: TickerItemType;
  title: string;
}): string {
  if (item.title.length <= 24) return item.title.toUpperCase();
  const prefix: Record<TickerItemType, string> = {
    fire: "FIRE",
    alert: "ALERT",
    warning: "WATCH",
    ranking: "RANK",
    fresh_drop: "DROP",
  };
  return prefix[item.type];
}

function tickerDetail(item: {
  product_name?: string | null;
  brand_name?: string | null;
  city?: string | null;
  title: string;
}): string {
  const parts = [item.product_name, item.brand_name, item.city].filter(Boolean);
  if (parts.length) return parts.join(" · ");
  return item.title;
}

export function BoofTicker() {
  const items = useTickerItems();
  const loop = [...items, ...items];

  return (
    <div
      className="relative -mx-4 overflow-hidden border-y border-emerald-500/20 bg-zinc-950/90 sm:-mx-6 lg:-mx-8"
      aria-label="Live activity ticker"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-zinc-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-zinc-950 to-transparent" />

      <div className="flex items-center gap-0">
        <div className="z-20 flex shrink-0 items-center gap-2 border-r border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 sm:px-4">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 sm:text-xs">
            Live
          </span>
        </div>

        <div className="ticker-track flex min-w-0 flex-1 items-center gap-8 py-2.5">
          {loop.map((item, i) => (
            <div
              key={`${item.id}-${i}`}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs sm:text-sm"
            >
              <span
                className={`font-heading text-[10px] font-bold uppercase tracking-wider sm:text-xs ${typeStyles[item.type]}`}
              >
                {tickerLabel(item)}
              </span>
              <span className="text-zinc-500">·</span>
              <span className="font-medium text-zinc-300">
                {tickerDetail(item)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
