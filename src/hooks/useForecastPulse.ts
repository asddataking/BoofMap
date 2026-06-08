"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { isConvexConfigured } from "@/lib/convex/config";
import { DEMO_FORECAST_MARKETS } from "@/lib/intelligence/forecast";
import { FORECAST_PULSE_ENABLED } from "@/lib/intelligence/featureFlags";
import type {
  ForecastConfidence,
  ForecastMarket,
  ForecastProfile,
  ForecastVoteChoice,
} from "@/lib/intelligence/types";

export function useActiveForecastMarkets(limit = 8): ForecastMarket[] {
  const data = useQuery(
    api.forecast.listActiveMarkets,
    isConvexConfigured() && FORECAST_PULSE_ENABLED ? { limit } : "skip"
  );
  const markets = data as ForecastMarket[] | undefined;
  if (!FORECAST_PULSE_ENABLED) return [];
  if (markets) return markets;
  if (!isConvexConfigured()) return DEMO_FORECAST_MARKETS.slice(0, limit);
  return [];
}

export function useProductForecastMarkets(
  productSlug: string,
  limit = 3
): ForecastMarket[] {
  const data = useQuery(
    api.forecast.getMarketsForProduct,
    isConvexConfigured() && FORECAST_PULSE_ENABLED
      ? { productSlug, limit }
      : "skip"
  );
  const markets = data as ForecastMarket[] | undefined;
  if (!FORECAST_PULSE_ENABLED) return [];
  if (markets) return markets;
  if (!isConvexConfigured()) {
    return DEMO_FORECAST_MARKETS.filter(
      (m) => m.product_slug === productSlug
    ).slice(0, limit);
  }
  return [];
}

export function useBrandForecastMarkets(
  brandSlug: string,
  limit = 3
): ForecastMarket[] {
  const data = useQuery(
    api.forecast.getMarketsForBrand,
    isConvexConfigured() && FORECAST_PULSE_ENABLED
      ? { brandSlug, limit }
      : "skip"
  );
  const markets = data as ForecastMarket[] | undefined;
  if (!FORECAST_PULSE_ENABLED) return [];
  if (markets) return markets;
  if (!isConvexConfigured()) {
    return DEMO_FORECAST_MARKETS.filter(
      (m) => m.brand_slug === brandSlug && m.target_type === "brand"
    ).slice(0, limit);
  }
  return [];
}

export function useMyForecastProfile(): ForecastProfile | null {
  const data = useQuery(
    api.forecast.getMyForecastProfile,
    isConvexConfigured() && FORECAST_PULSE_ENABLED ? {} : "skip"
  );
  return (data as ForecastProfile | null | undefined) ?? null;
}

export function useForecastStats() {
  const data = useQuery(
    api.forecast.getForecastStats,
    isConvexConfigured() && FORECAST_PULSE_ENABLED ? {} : "skip"
  );
  if (data) {
    return data as {
      active_markets: number;
      open_forecasts: number;
      total_forecasts: number;
    };
  }

  if (!isConvexConfigured()) {
    const demoTotal = DEMO_FORECAST_MARKETS.reduce(
      (s, m) => s + m.total_forecasts,
      0
    );
    return {
      active_markets: DEMO_FORECAST_MARKETS.length,
      open_forecasts: demoTotal,
      total_forecasts: demoTotal,
    };
  }

  return { active_markets: 0, open_forecasts: 0, total_forecasts: 0 };
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
