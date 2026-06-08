"use client";

import {
  DEMO_PLATFORM_STATS,
  DEMO_TOP_FLOWER,
} from "@/lib/intelligence/rankings";
import {
  resolvePlatformStats,
  resolveRankingList,
} from "@/lib/intelligence/resolveIntelligence";
import {
  derivePlatformStats,
  deriveTopFlower,
} from "@/lib/intelligence/deriveIntelligence";
import {
  getSeedPlatformStats,
  getSeedTopFlower,
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
