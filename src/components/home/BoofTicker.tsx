"use client";

import { useTickerItems } from "@/hooks/useHomeData";
import type { TickerItemType } from "@/lib/types";

const typeStyles: Record<
  TickerItemType,
  { label: string; className: string; emoji: string }
> = {
  fire: {
    label: "FIRE FIND",
    className: "text-[#39FF88]",
    emoji: "🔥",
  },
  alert: {
    label: "BOOF ALERT",
    className: "text-[#FF3B3B]",
    emoji: "🚨",
  },
  warning: {
    label: "WATCH",
    className: "text-[#FF7A00]",
    emoji: "⚠️",
  },
  ranking: {
    label: "SIGNAL",
    className: "text-[#9AC434]",
    emoji: "📈",
  },
  fresh_drop: {
    label: "DROP",
    className: "text-[#FFD23F]",
    emoji: "✨",
  },
};

const DEMO_TICKER = [
  "🔥 FIRE FIND: Local Grove Runtz +12 today",
  "⚠️ 3 Mold Reports in Ann Arbor",
  "🚨 BOOF ALERT: Fake Hytek carts circulating",
  "📈 Peninsula Gardens top rated strain",
];

function formatTickerLine(item: {
  type: TickerItemType;
  title: string;
  product_name?: string | null;
  brand_name?: string | null;
  city?: string | null;
}): string {
  const style = typeStyles[item.type];
  const parts = [item.product_name, item.brand_name, item.city].filter(Boolean);
  const detail = parts.length ? parts.join(" · ") : item.title;
  return `${style.emoji} ${style.label}: ${detail}`;
}

export function BoofTicker() {
  const items = useTickerItems();
  const lines =
    items.length > 0
      ? items.map((item) => formatTickerLine(item))
      : DEMO_TICKER;
  const loop = [...lines, ...lines];

  return (
    <div
      className="relative -mx-4 overflow-hidden border-y border-[var(--border-soft)] bg-[var(--bg-panel)] sm:-mx-6 lg:-mx-8"
      aria-label="Live activity ticker"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[var(--bg-panel)] to-transparent sm:w-14" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[var(--bg-panel)] to-transparent sm:w-14" />

      <div className="flex items-stretch">
        <div className="z-20 flex shrink-0 items-center gap-2 border-r border-[#39FF88]/25 bg-[#39FF88]/10 px-3 py-2 sm:px-4">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39FF88] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#39FF88]" />
          </span>
          <span className="font-display text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#39FF88] sm:text-xs">
            Live
          </span>
        </div>

        <div className="ticker-track flex min-w-0 flex-1 items-center gap-6 py-2 sm:gap-10 sm:py-2.5">
          {loop.map((line, i) => {
            const isAlert = line.includes("BOOF") || line.includes("🚨");
            const isFire = line.includes("FIRE") || line.includes("🔥");
            const labelClass = isAlert
              ? "text-[#FF3B3B]"
              : isFire
                ? "text-[#39FF88]"
                : line.includes("⚠️")
                  ? "text-[#FF7A00]"
                  : "text-[#9AC434]";

            const [label, ...rest] = line.split(":");
            const body = rest.join(":").trim();

            return (
              <div
                key={`${i}-${line.slice(0, 24)}`}
                className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs sm:text-sm"
              >
                <span
                  className={`font-display text-[10px] font-extrabold uppercase tracking-wider sm:text-xs ${labelClass}`}
                >
                  {label}
                </span>
                {body && (
                  <>
                    <span className="text-[var(--text-muted)]">·</span>
                    <span className="font-medium text-[var(--text-main)]">
                      {body}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
