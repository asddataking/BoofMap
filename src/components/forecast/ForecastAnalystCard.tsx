"use client";

import Link from "next/link";
import { BarChart3, Target } from "lucide-react";
import { useMyForecastProfile } from "@/hooks/useForecastPulse";
import { FORECAST_PULSE_ENABLED } from "@/lib/intelligence/featureFlags";

export function ForecastAnalystCard() {
  const profile = useMyForecastProfile();

  if (!FORECAST_PULSE_ENABLED) return null;

  return (
    <div className="rounded-xl border border-[#5BC0EB]/25 bg-gradient-to-br from-[#5BC0EB]/5 to-[var(--bg-card)] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5BC0EB]/15 text-[#5BC0EB]">
          <Target className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="section-kicker !mb-1">Forecast Pulse</p>
          <h3 className="font-display text-lg font-bold uppercase text-[var(--text-main)]">
            {profile?.analyst_tier_label ?? "Rookie Analyst"}
          </h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {profile
              ? `${profile.total_forecasts} forecasts · ${profile.accuracy_percent}% accuracy`
              : "Submit forecasts to build your analyst reputation."}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Forecasts" value={profile?.total_forecasts ?? 0} />
        <Stat label="Correct" value={profile?.correct_forecasts ?? 0} />
        <Stat label="Rank" value={profile?.forecast_rank ?? "—"} />
      </div>

      <Link
        href="/"
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#5BC0EB] hover:underline"
      >
        <BarChart3 className="h-3.5 w-3.5" />
        View active forecasts
      </Link>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-[var(--border-soft)] bg-[var(--bg-card)] px-2 py-2">
      <p className="font-display text-lg font-black tabular-nums text-[var(--text-main)]">
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </p>
    </div>
  );
}
