"use client";

import { cn } from "@/lib/utils";

export function ScoreRing({
  score,
  size = 48,
  className,
}: {
  score: number;
  size?: number;
  className?: string;
}) {
  const pct = Math.min(100, (score / 5) * 100);
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const stroke =
    score <= 2
      ? "#ef4444"
      : score <= 3.5
        ? "#f59e0b"
        : score <= 4.5
          ? "#10b981"
          : "#34d399";

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth={3}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums text-white">
        {score.toFixed(1)}
      </span>
    </div>
  );
}
