"use client";

import { cn } from "@/lib/utils";
import {
  boofScoreToIntel,
  intelVerdict,
  intelVerdictFromBoofScore,
  intelVerdictStyles,
  type IntelVerdict,
} from "@/lib/intelScore";

export type IntelMetricKey =
  | "flavor"
  | "freshness"
  | "smoothness"
  | "value"
  | "trust";

export type IntelMetrics = Partial<Record<IntelMetricKey, number>>;

const METRIC_LABELS: Record<IntelMetricKey, string> = {
  flavor: "Flavor",
  freshness: "Freshness",
  smoothness: "Smoothness",
  value: "Value",
  trust: "Trust",
};

export function IntelScore({
  score,
  boofScore,
  size = 72,
  showBreakdown = false,
  metrics,
  className,
}: {
  /** 0–100 intel score */
  score?: number;
  /** 1–5 community boof score (converted to 0–100) */
  boofScore?: number;
  size?: number;
  showBreakdown?: boolean;
  metrics?: IntelMetrics;
  className?: string;
}) {
  const value =
    score ?? (boofScore != null ? boofScoreToIntel(boofScore) : 0);
  const verdict: IntelVerdict =
    score != null
      ? intelVerdict(score)
      : boofScore != null
        ? intelVerdictFromBoofScore(boofScore)
        : "MID";
  const styles = intelVerdictStyles[verdict];
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-4">
        <div
          className={cn("relative shrink-0 rounded-full", styles.glow)}
          style={{ width: size, height: size }}
        >
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={4}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={styles.ring}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="font-display text-xl font-black tabular-nums leading-none text-white"
              style={{ fontSize: size * 0.28 }}
            >
              {value}
            </span>
          </div>
        </div>
        <div>
          <p
            className={cn(
              "font-display text-sm font-bold uppercase tracking-wider",
              styles.text
            )}
          >
            {verdict}
          </p>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Community intel score
          </p>
        </div>
      </div>

      {showBreakdown && metrics && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(Object.keys(METRIC_LABELS) as IntelMetricKey[]).map((key) => {
            const v = metrics[key];
            if (v == null) return null;
            return (
              <li
                key={key}
                className="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-card)] px-2.5 py-2"
              >
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                  {METRIC_LABELS[key]}
                </p>
                <p className="font-display text-lg font-bold tabular-nums text-white">
                  {v}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
