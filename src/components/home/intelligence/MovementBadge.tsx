"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";

export function MovementBadge({
  movement,
  size = "sm",
}: {
  movement: number;
  size?: "sm" | "md";
}) {
  const isUp = movement > 0.05;
  const isDown = movement < -0.05;
  const sizeClass = size === "md" ? "text-sm" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-0.5 font-display font-bold tabular-nums ${sizeClass} ${
        isUp
          ? "text-[#39FF88]"
          : isDown
            ? "text-[#FF3B3B]"
            : "text-[var(--text-muted)]"
      }`}
    >
      {isUp ? (
        <ArrowUp className="h-3 w-3" />
      ) : isDown ? (
        <ArrowDown className="h-3 w-3" />
      ) : (
        <Minus className="h-3 w-3" />
      )}
      {Math.abs(movement).toFixed(1)}
    </span>
  );
}
