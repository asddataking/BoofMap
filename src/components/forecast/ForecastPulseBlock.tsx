"use client";

import { BarChart3 } from "lucide-react";
import {
  useBrandForecastMarkets,
  useProductForecastMarkets,
} from "@/hooks/useForecastPulse";
import { FORECAST_PULSE_ENABLED } from "@/lib/intelligence/featureFlags";
import { ForecastPulseRail } from "./ForecastPulseRail";
import { ForecastSentimentBar } from "./ForecastSentimentBar";

export function ProductForecastPulse({
  productSlug,
  bullishPercent,
}: {
  productSlug: string;
  bullishPercent?: number | null;
}) {
  const markets = useProductForecastMarkets(productSlug);

  if (!FORECAST_PULSE_ENABLED) return null;

  if (markets.length > 0) {
    return (
      <section aria-label="Product forecasts" className="mt-8">
        <ForecastBlockHeader />
        <ForecastPulseRail markets={markets} compact />
      </section>
    );
  }

  if (bullishPercent == null) return null;

  return (
    <section aria-label="Product forecast sentiment" className="mt-6">
      <ForecastBlockHeader />
      <div className="glass-card p-4">
        <p className="text-sm text-[var(--text-muted)]">
          {bullishPercent}% of the community is bullish on this product&apos;s
          near-term momentum.
        </p>
        <div className="mt-3">
          <ForecastSentimentBar bullishPercent={bullishPercent} />
        </div>
      </div>
    </section>
  );
}

export function BrandForecastPulse({ brandSlug }: { brandSlug: string }) {
  const markets = useBrandForecastMarkets(brandSlug);

  if (!FORECAST_PULSE_ENABLED || markets.length === 0) return null;

  return (
    <section aria-label="Brand forecasts" className="mt-8">
      <ForecastBlockHeader />
      <ForecastPulseRail markets={markets} compact />
    </section>
  );
}

function ForecastBlockHeader() {
  return (
    <div className="mb-4 flex items-center gap-2">
      <BarChart3 className="h-4 w-4 text-[#5BC0EB]" />
      <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
        Forecast Pulse
      </h2>
    </div>
  );
}
