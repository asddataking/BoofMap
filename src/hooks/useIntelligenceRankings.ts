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
import {
  resolvePlatformStats,
  resolveRankingList,
} from "@/lib/intelligence/resolveIntelligence";
import {
  getSeedBiggestMovers,
  getSeedFallingBrands,
  getSeedFallingProducts,
  getSeedHotDrops,
  getSeedPlatformStats,
  getSeedRisingBrands,
  getSeedTopFlower,
  getSeedValuePicks,
} from "@/lib/intelligence/seedIntelligence";
import type {
  IntelligenceRankingEntry,
  PlatformStats,
} from "@/lib/intelligence/types";

export function usePlatformStats(): PlatformStats {
  const data = useQuery(
    api.intelligence.getPlatformStats,
    isConvexConfigured() ? {} : "skip"
  );
  return resolvePlatformStats(
    data as PlatformStats | undefined,
    getSeedPlatformStats(),
    DEMO_PLATFORM_STATS
  );
}

export function useTopFlowerThisWeek(): IntelligenceRankingEntry[] {
  const data = useQuery(
    api.intelligence.getTopFlowerThisWeek,
    isConvexConfigured() ? { limit: 10 } : "skip"
  );
  return resolveRankingList(
    data as IntelligenceRankingEntry[] | undefined,
    getSeedTopFlower(10),
    DEMO_TOP_FLOWER
  );
}

export function useBiggestMovers(): IntelligenceRankingEntry[] {
  const data = useQuery(
    api.intelligence.getBiggestMovers,
    isConvexConfigured() ? { limit: 8 } : "skip"
  );
  return resolveRankingList(
    data as IntelligenceRankingEntry[] | undefined,
    getSeedBiggestMovers(8),
    DEMO_MOVERS
  );
}

export function useHotDrops(): IntelligenceRankingEntry[] {
  const data = useQuery(
    api.intelligence.getHotDrops,
    isConvexConfigured() ? { limit: 8 } : "skip"
  );
  return resolveRankingList(
    data as IntelligenceRankingEntry[] | undefined,
    getSeedHotDrops(8),
    DEMO_HOT_DROPS
  );
}

export function useValuePicks(): IntelligenceRankingEntry[] {
  const data = useQuery(
    api.intelligence.getValuePicks,
    isConvexConfigured() ? { limit: 8 } : "skip"
  );
  return resolveRankingList(
    data as IntelligenceRankingEntry[] | undefined,
    getSeedValuePicks(8),
    DEMO_VALUE_PICKS
  );
}

export function useRisingBrands(): IntelligenceRankingEntry[] {
  const data = useQuery(
    api.intelligence.getRisingBrands,
    isConvexConfigured() ? { limit: 6 } : "skip"
  );
  return resolveRankingList(
    data as IntelligenceRankingEntry[] | undefined,
    getSeedRisingBrands(6),
    []
  );
}

export function useFallingBrands(): IntelligenceRankingEntry[] {
  const data = useQuery(
    api.intelligence.getFallingBrands,
    isConvexConfigured() ? { limit: 6 } : "skip"
  );
  return resolveRankingList(
    data as IntelligenceRankingEntry[] | undefined,
    getSeedFallingBrands(6),
    []
  );
}

export function useFallingProducts(): IntelligenceRankingEntry[] {
  const data = useQuery(
    api.intelligence.getFallingProducts,
    isConvexConfigured() ? { limit: 8 } : "skip"
  );
  return resolveRankingList(
    data as IntelligenceRankingEntry[] | undefined,
    getSeedFallingProducts(8),
    DEMO_FALLING_PRODUCTS
  );
}
