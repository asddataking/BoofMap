"use client";

import { motion } from "framer-motion";
import { useMarketStatus } from "@/hooks/useIntelligenceData";
import { IntelGridOverlay } from "./IntelGridOverlay";

export function MarketStatusModule({ state = "MI" }: { state?: string }) {
  const status = useMarketStatus(state);
  const stateName = state === "MI" ? "Michigan" : state;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      aria-label="Market status"
      className="relative overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)]"
    >
      <IntelGridOverlay />
      <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-[#39FF88]/30 animate-[radar-ping_3s_ease-out_infinite]" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-[#39FF88] shadow-[0_0_12px_#39FF88]" />
          </div>
          <div>
            <p className="section-kicker !mb-0">Market Status</p>
            <h2 className="font-display text-lg font-extrabold uppercase tracking-tight text-[var(--text-main)] sm:text-xl">
              {stateName} Market Status
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          <StatusPill
            emoji="🟢"
            label={
              status.fire_reports_rising
                ? "Fire Reports Rising"
                : "Fire Reports Steady"
            }
            detail={`${status.fire_trend_pct > 0 ? "+" : ""}${status.fire_trend_pct}%`}
            positive={status.fire_reports_rising}
          />
          <StatusPill
            emoji="🔴"
            label="New Boof Alerts"
            detail={`${status.new_boof_alerts} this week`}
            alert
          />
          <StatusPill
            emoji="🟡"
            label="Batch Warnings"
            detail={`${status.batch_warnings} active`}
            warning
          />
        </div>
      </div>
    </motion.section>
  );
}

function StatusPill({
  emoji,
  label,
  detail,
  positive,
  alert,
  warning,
}: {
  emoji: string;
  label: string;
  detail: string;
  positive?: boolean;
  alert?: boolean;
  warning?: boolean;
}) {
  const border = positive
    ? "border-[#39FF88]/30"
    : alert
      ? "border-[#FF3B3B]/30"
      : warning
        ? "border-[#FFD23F]/30"
        : "border-[var(--border-soft)]";

  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg border bg-[var(--bg-panel)]/60 px-3 py-2.5 ${border}`}
    >
      <span className="text-base">{emoji}</span>
      <div>
        <p className="font-display text-[11px] font-bold uppercase tracking-wide text-[var(--text-main)]">
          {label}
        </p>
        <p className="text-[10px] text-[var(--text-muted)]">{detail}</p>
      </div>
    </div>
  );
}
