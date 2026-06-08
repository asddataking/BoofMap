"use client";

import { BarChart3 } from "lucide-react";

export function ForecastPulseAnnotation({
  bullishPercent,
  className = "",
}: {
  bullishPercent: number;
  className?: string;
}) {
  return (
    <p
      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#5BC0EB] ${className}`}
    >
      <BarChart3 className="h-3 w-3" />
      {bullishPercent}% bullish this week
    </p>
  );
}
