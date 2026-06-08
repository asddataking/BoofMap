"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { DEMO_FORECAST_MARKETS } from "@/lib/intelligence/forecast";
import { FORECAST_PULSE_ENABLED } from "@/lib/intelligence/featureFlags";
import type {
  ForecastConfidence,
  ForecastMarket,
  ForecastProfile,
  ForecastVoteChoice,
} from "@/lib/intelligence/types";

const demoTotal = DEMO_FORECAST_MARKETS.reduce(
  (s, m) => s + m.total_forecasts,
  0
);

const DEMO_STATS = {
  active_markets: DEMO_FORECAST_MARKETS.length,
  open_forecasts: demoTotal,
  total_forecasts: demoTotal,
};

/**
 * Forecast Convex functions are not yet on every deployment — use demo markets
 * until `npx convex deploy --prod` includes the forecast module.
 */
export function useActiveForecastMarkets(limit = 8): ForecastMarket[] {
  if (!FORECAST_PULSE_ENABLED) return [];
  return DEMO_FORECAST_MARKETS.slice(0, limit);
}

export function useProductForecastMarkets(
  productSlug: string,
  limit = 3
): ForecastMarket[] {
  if (!FORECAST_PULSE_ENABLED) return [];
  return DEMO_FORECAST_MARKETS.filter(
    (m) => m.product_slug === productSlug
  ).slice(0, limit);
}

export function useBrandForecastMarkets(
  brandSlug: string,
  limit = 3
): ForecastMarket[] {
  if (!FORECAST_PULSE_ENABLED) return [];
  return DEMO_FORECAST_MARKETS.filter(
    (m) => m.brand_slug === brandSlug && m.target_type === "brand"
  ).slice(0, limit);
}

export function useMyForecastProfile(): ForecastProfile | null {
  return null;
}

export function useForecastStats() {
  if (!FORECAST_PULSE_ENABLED) {
    return { active_markets: 0, open_forecasts: 0, total_forecasts: 0 };
  }
  return DEMO_STATS;
}

export function useVoteOnForecast() {
  const voteMutation = useMutation(api.forecast.voteOnMarket);

  return async ({
    marketId,
    vote,
    confidence,
  }: {
    marketId: string;
    vote: ForecastVoteChoice;
    confidence: ForecastConfidence;
  }) => {
    if (!FORECAST_PULSE_ENABLED) {
      return { error: "Forecast Pulse is not enabled" };
    }
    return await voteMutation({
      marketId: marketId as Id<"markets">,
      vote,
      confidence,
    });
  };
}
