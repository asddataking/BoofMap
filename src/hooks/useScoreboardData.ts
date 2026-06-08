"use client";

import { useMemo } from "react";
import {
  DEMO_FALLING_PRODUCTS,
  DEMO_HOT_DROPS,
  DEMO_MOVERS,
  DEMO_VALUE_PICKS,
} from "@/lib/intelligence/rankings";
import { resolveRankingList } from "@/lib/intelligence/resolveIntelligence";
import {
  deriveBiggestMovers,
  deriveFallingBrands,
  deriveFallingProducts,
  deriveHotDrops,
  deriveRisingBrands,
  deriveValuePicks,
} from "@/lib/intelligence/deriveIntelligence";
import {
  getSeedBiggestMovers,
  getSeedFallingBrands,
  getSeedFallingProducts,
  getSeedHotDrops,
  getSeedRisingBrands,
  getSeedValuePicks,
} from "@/lib/intelligence/seedIntelligence";
import type { IntelligenceRankingEntry } from "@/lib/intelligence/types";
import { useIntelligenceReports } from "./useIntelligenceReports";

export type ScoreboardTab =
  | "movers"
  | "falling"
  | "hot-drops"
  | "value"
  | "brands";

export type ScoreboardData = {
  movers: IntelligenceRankingEntry[];
  falling: IntelligenceRankingEntry[];
  hotDrops: IntelligenceRankingEntry[];
  value: IntelligenceRankingEntry[];
  risingBrands: IntelligenceRankingEntry[];
  fallingBrands: IntelligenceRankingEntry[];
};

/** Single derived payload for the homepage intelligence scoreboard. */
export function useScoreboardData(): ScoreboardData {
  const reports = useIntelligenceReports();

  return useMemo(
    () => ({
      movers: resolveRankingList(
        deriveBiggestMovers(reports, 8),
        getSeedBiggestMovers(8),
        DEMO_MOVERS
      ),
      falling: resolveRankingList(
        deriveFallingProducts(reports, 8),
        getSeedFallingProducts(8),
        DEMO_FALLING_PRODUCTS
      ),
      hotDrops: resolveRankingList(
        deriveHotDrops(reports, 8),
        getSeedHotDrops(8),
        DEMO_HOT_DROPS
      ),
      value: resolveRankingList(
        deriveValuePicks(reports, 8),
        getSeedValuePicks(8),
        DEMO_VALUE_PICKS
      ),
      risingBrands: resolveRankingList(
        deriveRisingBrands(reports, 6),
        getSeedRisingBrands(6),
        []
      ),
      fallingBrands: resolveRankingList(
        deriveFallingBrands(reports, 6),
        getSeedFallingBrands(6),
        []
      ),
    }),
    [reports]
  );
}
