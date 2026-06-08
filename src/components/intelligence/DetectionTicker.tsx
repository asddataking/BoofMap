"use client";

import { useSignalEvents } from "@/hooks/useIntelligenceData";
import type { SignalEvent } from "@/lib/intelligence/types";

const TYPE_STYLES: Record<
  string,
  { emoji: string; label: string; className: string }
> = {
  fire_trending: { emoji: "🔥", label: "FIRE", className: "text-[#39FF88]" },
  boof_alert: { emoji: "🚨", label: "BOOF", className: "text-[#FF3B3B]" },
  value_detected: { emoji: "💰", label: "VALUE", className: "text-[#FFD23F]" },
  batch_warning: { emoji: "⚠️", label: "WARNING", className: "text-[#FF7A00]" },
  ranking_move: { emoji: "📈", label: "SIGNAL", className: "text-[#9AC434]" },
  brand_entry: { emoji: "🏷", label: "BRAND", className: "text-[#39FF88]" },
  fake_cart: { emoji: "🚨", label: "ALERT", className: "text-[#FF3B3B]" },
};

function formatLine(event: SignalEvent): { label: string; body: string; className: string } {
  const style = TYPE_STYLES[event.type] ?? TYPE_STYLES.ranking_move;
  return {
    label: `${style.emoji} ${style.label}`,
    body: event.title,
    className: style.className,
  };
}

export function DetectionTicker() {
  const events = useSignalEvents();
  const lines = events.map(formatLine);
  const loop = [...lines, ...lines];

  return (
    <div
      className="relative -mx-4 overflow-hidden border-y border-[var(--border-soft)] bg-[var(--bg-panel)] sm:-mx-6 lg:-mx-8"
      role="region"
      aria-label="Live report ticker"
    >
      <div className="sr-only" aria-live="polite">
        Live cannabis intelligence signals
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[var(--bg-panel)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[var(--bg-panel)] to-transparent" />

      <div className="flex items-stretch">
        <div className="z-20 flex shrink-0 items-center gap-2 border-r border-[#39FF88]/25 bg-[#39FF88]/8 px-3 py-2 sm:px-4">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39FF88] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#39FF88]" />
          </span>
          <span className="font-display text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#39FF88] sm:text-xs">
            Live Intel
          </span>
        </div>

        <div className="ticker-track flex min-w-0 flex-1 items-center gap-8 py-2 sm:gap-12 sm:py-2.5">
          {loop.map((line, i) => (
            <div
              key={`${i}-${line.body.slice(0, 16)}`}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs sm:text-sm"
            >
              <span
                className={`font-display text-[10px] font-extrabold uppercase tracking-wider sm:text-xs ${line.className}`}
              >
                {line.label}
              </span>
              <span className="text-[var(--text-muted)]">·</span>
              <span className="font-medium text-[var(--text-main)]">
                {line.body}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
