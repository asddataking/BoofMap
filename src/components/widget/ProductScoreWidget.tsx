"use client";

import type { ProductIntelligenceScore } from "@/lib/intelligence/types";

const SCORE_ROWS = [
  { key: "flavor_score" as const, label: "Flavor", color: "#39FF88" },
  { key: "burn_score" as const, label: "Burn", color: "#FF7A00" },
  { key: "value_score" as const, label: "Value", color: "#FFD23F" },
  { key: "community_score" as const, label: "Community", color: "#9AC434" },
] as const;

export function ProductScoreWidget({
  score,
  compact = false,
}: {
  score: ProductIntelligenceScore;
  compact?: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[#0b0f0c] font-sans text-[#f5f5f5] ${
        compact ? "p-3" : "p-4"
      }`}
      style={{ minWidth: compact ? 240 : 280 }}
    >
      <div className="mb-3 border-b border-white/10 pb-3">
        <p className="font-display text-sm font-bold uppercase tracking-tight">
          {score.product_name}
        </p>
        <p className="text-xs text-[#a6adb3]">{score.brand_name}</p>
      </div>

      <div className="space-y-2.5">
        {SCORE_ROWS.map(({ key, label, color }) => (
          <ScoreBar
            key={key}
            label={label}
            value={score[key]}
            color={color}
            compact={compact}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
        <p className="text-[10px] text-[#a6adb3]">
          {score.report_count} community report
          {score.report_count !== 1 ? "s" : ""}
        </p>
        <p className="font-display text-[9px] font-bold uppercase tracking-[0.15em] text-[#39FF88]/80">
          Powered by BoofMap
        </p>
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  color,
  compact,
}: {
  label: string;
  value: number;
  color: string;
  compact?: boolean;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span
          className={`font-display font-bold uppercase tracking-wider text-[#a6adb3] ${
            compact ? "text-[9px]" : "text-[10px]"
          }`}
        >
          {label}
        </span>
        <span
          className={`font-display font-black tabular-nums ${
            compact ? "text-xs" : "text-sm"
          }`}
          style={{ color }}
        >
          {value}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
