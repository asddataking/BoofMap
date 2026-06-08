"use client";

import { cn } from "@/lib/utils";

export function ForecastSentimentBar({
  bullishPercent,
  compact = false,
  showLabels = true,
  className,
}: {
  bullishPercent: number;
  compact?: boolean;
  showLabels?: boolean;
  className?: string;
}) {
  const bearishPercent = 100 - bullishPercent;

  return (
    <div className={cn("w-full", className)}>
      {showLabels && (
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold">
          <span className="text-[#39FF88]">YES {bullishPercent}%</span>
          <span className="text-[#FF3B3B]">NO {bearishPercent}%</span>
        </div>
      )}
      <div
        className={cn(
          "flex overflow-hidden rounded-full bg-[var(--bg-elevated)]",
          compact ? "h-2" : "h-2.5"
        )}
      >
        <div
          className="h-full bg-[#39FF88] transition-all"
          style={{ width: `${bullishPercent}%` }}
        />
        <div
          className="h-full bg-[#FF3B3B] transition-all"
          style={{ width: `${bearishPercent}%` }}
        />
      </div>
    </div>
  );
}
