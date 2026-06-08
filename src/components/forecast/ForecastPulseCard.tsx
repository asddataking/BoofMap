"use client";

import { motion } from "framer-motion";
import { BarChart3, Clock } from "lucide-react";
import { ForecastSentimentBar } from "./ForecastSentimentBar";
import type { ForecastMarket } from "@/lib/intelligence/types";

export function ForecastPulseCard({
  market,
  index = 0,
  onForecast,
  compact = false,
}: {
  market: ForecastMarket;
  index?: number;
  onForecast: (market: ForecastMarket) => void;
  compact?: boolean;
}) {
  const hasVoted = market.user_vote != null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className={`flex h-full flex-col rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#5BC0EB]/15 text-[#5BC0EB]">
          <BarChart3 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[#5BC0EB]">
            Forecast Pulse
          </p>
          <h3
            className={`mt-1 font-medium leading-snug text-[var(--text-main)] ${
              compact ? "text-sm" : "text-base"
            }`}
          >
            {market.question}
          </h3>
        </div>
      </div>

      <div className="mt-4">
        <ForecastSentimentBar bullishPercent={market.bullish_percent} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>
          {market.total_forecasts.toLocaleString()} Community Forecast
          {market.total_forecasts !== 1 ? "s" : ""}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Closes in {market.days_left} day{market.days_left !== 1 ? "s" : ""}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onForecast(market)}
        className={`mt-4 w-full rounded-lg border py-2.5 font-display text-xs font-bold uppercase tracking-wider transition ${
          hasVoted
            ? "border-[#39FF88]/40 bg-[#39FF88]/10 text-[#39FF88]"
            : "border-[#5BC0EB]/40 bg-[#5BC0EB]/10 text-[#5BC0EB] hover:border-[#5BC0EB]/60"
        }`}
      >
        {hasVoted ? "Forecast Submitted" : "Forecast"}
      </button>
    </motion.article>
  );
}
