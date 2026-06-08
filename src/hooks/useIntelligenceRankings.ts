"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexConfigured } from "@/lib/convex/config";
import {
  DEMO_FALLING_PRODUCTS,
  DEMO_HOT_DROPS,
  DEMO_MOVERS,
  DEMO_PLATFORM_STATS,
  DEMO_TOP_FLOWER,
  DEMO_VALUE_PICKS,
} from "@/lib/intelligence/rankings";
import type {
  IntelligenceRankingEntry,
  PlatformStats,
} from "@/lib/intelligence/types";

export function usePlatformStats(): PlatformStats {
  const data = useQuery(
    api.intelligence.getPlatformStats,
    isConvexConfigured() ? {} : "skip"
  );
  return (data as PlatformStats | undefined) ?? DEMO_PLATFORM_STATS;
}

export function useTopFlowerThisWeek(): IntelligenceRankingEntry[] {
  const data = useQuery(
    api.intelligence.getTopFlowerThisWeek,
    isConvexConfigured() ? { limit: 10 } : "skip"
  );
  return (data as IntelligenceRankingEntry[] | undefined) ?? DEMO_TOP_FLOWER;
}

export function useBiggestMovers(): IntelligenceRankingEntry[] {
  const data = useQuery(
    api.intelligence.getBiggestMovers,
    isConvexConfigured() ? { limit: 8 } : "skip"
  );
  return (data as IntelligenceRankingEntry[] | undefined) ?? DEMO_MOVERS;
}

export function useHotDrops(): IntelligenceRankingEntry[] {
  const data = useQuery(
    api.intelligence.getHotDrops,
    isConvexConfigured() ? { limit: 8 } : "skip"
  );
  return (data as IntelligenceRankingEntry[] | undefined) ?? DEMO_HOT_DROPS;
}

export function useValuePicks(): IntelligenceRankingEntry[] {
  const data = useQuery(
    api.intelligence.getValuePicks,
    isConvexConfigured() ? { limit: 8 } : "skip"
  );
  return (data as IntelligenceRankingEntry[] | undefined) ?? DEMO_VALUE_PICKS;
}

export function useRisingBrands(): IntelligenceRankingEntry[] {
  const data = useQuery(
    api.intelligence.getRisingBrands,
    isConvexConfigured() ? { limit: 6 } : "skip"
  );
  return (data as IntelligenceRankingEntry[] | undefined) ?? [];
}

export function useFallingBrands(): IntelligenceRankingEntry[] {
  const data = useQuery(
    api.intelligence.getFallingBrands,
    isConvexConfigured() ? { limit: 6 } : "skip"
  );
  return (data as IntelligenceRankingEntry[] | undefined) ?? [];
}

export function useFallingProducts(): IntelligenceRankingEntry[] {
  const data = useQuery(
    api.intelligence.getFallingProducts,
    isConvexConfigured() ? { limit: 8 } : "skip"
  );
  return (data as IntelligenceRankingEntry[] | undefined) ?? DEMO_FALLING_PRODUCTS;
}
