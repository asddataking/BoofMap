"use client";

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
  deriveBiggestMovers,
  deriveFallingBrands,
  deriveFallingProducts,
  deriveHotDrops,
  derivePlatformStats,
  deriveRisingBrands,
  deriveTopFlower,
  deriveValuePicks,
} from "@/lib/intelligence/deriveIntelligence";
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
import { useIntelligenceReports } from "./useIntelligenceReports";

export function usePlatformStats(): PlatformStats {
  const reports = useIntelligenceReports();
  const derived = derivePlatformStats(reports);
  return resolvePlatformStats(
    derived.reports > 0 ? derived : undefined,
    getSeedPlatformStats(),
    DEMO_PLATFORM_STATS
  );
}

export function useTopFlowerThisWeek(): IntelligenceRankingEntry[] {
  const reports = useIntelligenceReports();
  return resolveRankingList(
    deriveTopFlower(reports, 10),
    getSeedTopFlower(10),
    DEMO_TOP_FLOWER
  );
}

export function useBiggestMovers(): IntelligenceRankingEntry[] {
  const reports = useIntelligenceReports();
  return resolveRankingList(
    deriveBiggestMovers(reports, 8),
    getSeedBiggestMovers(8),
    DEMO_MOVERS
  );
}

export function useHotDrops(): IntelligenceRankingEntry[] {
  const reports = useIntelligenceReports();
  return resolveRankingList(
    deriveHotDrops(reports, 8),
    getSeedHotDrops(8),
    DEMO_HOT_DROPS
  );
}

export function useValuePicks(): IntelligenceRankingEntry[] {
  const reports = useIntelligenceReports();
  return resolveRankingList(
    deriveValuePicks(reports, 8),
    getSeedValuePicks(8),
    DEMO_VALUE_PICKS
  );
}

export function useRisingBrands(): IntelligenceRankingEntry[] {
  const reports = useIntelligenceReports();
  return resolveRankingList(
    deriveRisingBrands(reports, 6),
    getSeedRisingBrands(6),
    []
  );
}

export function useFallingBrands(): IntelligenceRankingEntry[] {
  const reports = useIntelligenceReports();
  return resolveRankingList(
    deriveFallingBrands(reports, 6),
    getSeedFallingBrands(6),
    []
  );
}

export function useFallingProducts(): IntelligenceRankingEntry[] {
  const reports = useIntelligenceReports();
  return resolveRankingList(
    deriveFallingProducts(reports, 8),
    getSeedFallingProducts(8),
    DEMO_FALLING_PRODUCTS
  );
}
