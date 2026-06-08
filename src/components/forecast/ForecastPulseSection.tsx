"use client";

import { SectionHeader } from "@/components/home/intelligence/SectionHeader";
import { useActiveForecastMarkets } from "@/hooks/useForecastPulse";
import { FORECAST_PULSE_ENABLED } from "@/lib/intelligence/featureFlags";
import { ForecastPulseRail } from "./ForecastPulseRail";

export function ForecastPulseSection() {
  const markets = useActiveForecastMarkets(6);

  if (!FORECAST_PULSE_ENABLED || markets.length === 0) return null;

  return (
    <section aria-label="Forecast Pulse">
      <SectionHeader
        kicker="Community Forecasting"
        title="Forecast Pulse"
        subtitle="What the community believes happens next — no money, no betting, just intelligence signals."
      />
      <ForecastPulseRail markets={markets} />
    </section>
  );
}
