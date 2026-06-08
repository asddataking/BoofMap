"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexConfigured } from "@/lib/convex/config";
import type {
  Detection,
  IntelligenceStats,
  LeaderboardEntry,
  MarketReport,
  MarketStatus,
  SignalEvent,
} from "@/lib/intelligence/types";
import { LEADERBOARD_CATEGORIES } from "@/lib/intelligence/constants";
import { resolveRankingList } from "@/lib/intelligence/resolveIntelligence";
import { getSeedSignalEvents } from "@/lib/intelligence/seedIntelligence";

const DEMO_SIGNALS: SignalEvent[] = [
  {
    id: "demo-1",
    type: "fire_trending",
    title: "Honey Banana trending +12",
    brand_name: "Local Grove",
    product_name: "Honey Banana",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    type: "batch_warning",
    title: "Mold concern verified",
    city: "Ann Arbor",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    type: "value_detected",
    title: "New best value ounce detected",
    product_name: "Budget Kush",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-4",
    type: "ranking_move",
    title: "North Coast enters Top 10",
    brand_name: "North Coast",
    movement: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-5",
    type: "fake_cart",
    title: "Fake cart alert reported",
    city: "Detroit",
    created_at: new Date().toISOString(),
  },
];

const DEMO_STATS: IntelligenceStats = {
  fire_found: 128,
  boof_exposed: 47,
  community_savings: 2840,
  verified_signals: 312,
  fire_today: 14,
  boof_today: 6,
};

const DEMO_MARKET: MarketStatus = {
  state: "MI",
  fire_reports_rising: true,
  new_boof_alerts: 8,
  batch_warnings: 3,
  fire_trend_pct: 18,
  boof_trend_pct: 12,
  updated_at: new Date().toISOString(),
};

export function useSignalEvents(): SignalEvent[] {
  const data = useQuery(
    api.signalEvents.listActive,
    isConvexConfigured() ? { limit: 20 } : "skip"
  );
  return resolveRankingList(
    data as SignalEvent[] | undefined,
    getSeedSignalEvents(20),
    DEMO_SIGNALS
  );
}

export function useIntelligenceStats(): IntelligenceStats {
  const data = useQuery(
    api.signalEvents.getIntelligenceStats,
    isConvexConfigured() ? {} : "skip"
  );
  return (data as IntelligenceStats | undefined) ?? DEMO_STATS;
}

export function useMarketStatus(state = "MI"): MarketStatus {
  const data = useQuery(
    api.signalEvents.getMarketStatus,
    isConvexConfigured() ? { state } : "skip"
  );
  return (data as MarketStatus | undefined) ?? DEMO_MARKET;
}

export function useDetections(type?: "fire" | "boof" | "value" | "warning") {
  const data = useQuery(
    api.detections.listByType,
    isConvexConfigured() ? { type, limit: 20 } : "skip"
  );
  return (data as Detection[] | undefined) ?? [];
}

export function useLeaderboard(category: string) {
  const data = useQuery(
    api.leaderboards.getByCategory,
    isConvexConfigured()
      ? {
          category: category as (typeof LEADERBOARD_CATEGORIES)[number]["id"],
        }
      : "skip"
  );
  return data as
    | { entries: LeaderboardEntry[]; updated_at: string }
    | undefined;
}

export function useMarketReport(state = "MI"): MarketReport | undefined {
  const data = useQuery(
    api.marketReports.getLatest,
    isConvexConfigured() ? { state } : "skip"
  );
  return data as MarketReport | undefined;
}

export function useDetectorProfile() {
  return useQuery(
    api.profiles.getMine,
    isConvexConfigured() ? {} : "skip"
  );
}
