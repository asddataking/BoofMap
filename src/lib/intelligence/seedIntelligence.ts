import { getSeedApprovedReports } from "@/lib/convex/seed";
import {
  deriveBiggestMovers,
  deriveFallingBrands,
  deriveFallingProducts,
  deriveHotDrops,
  derivePlatformStats,
  deriveRisingBrands,
  deriveSignalEvents,
  deriveTopFlower,
  deriveValuePicks,
} from "./deriveIntelligence";
import type {
  IntelligenceRankingEntry,
  PlatformStats,
  SignalEvent,
} from "./types";

export function getSeedPlatformStats(): PlatformStats {
  return derivePlatformStats(getSeedApprovedReports());
}

export function getSeedTopFlower(limit = 10): IntelligenceRankingEntry[] {
  return deriveTopFlower(getSeedApprovedReports(), limit);
}

export function getSeedBiggestMovers(limit = 8): IntelligenceRankingEntry[] {
  return deriveBiggestMovers(getSeedApprovedReports(), limit);
}

export function getSeedFallingProducts(limit = 8): IntelligenceRankingEntry[] {
  return deriveFallingProducts(getSeedApprovedReports(), limit);
}

export function getSeedHotDrops(limit = 8): IntelligenceRankingEntry[] {
  return deriveHotDrops(getSeedApprovedReports(), limit);
}

export function getSeedValuePicks(limit = 8): IntelligenceRankingEntry[] {
  return deriveValuePicks(getSeedApprovedReports(), limit);
}

export function getSeedRisingBrands(limit = 6): IntelligenceRankingEntry[] {
  return deriveRisingBrands(getSeedApprovedReports(), limit);
}

export function getSeedFallingBrands(limit = 6): IntelligenceRankingEntry[] {
  return deriveFallingBrands(getSeedApprovedReports(), limit);
}

export function getSeedSignalEvents(limit = 20): SignalEvent[] {
  return deriveSignalEvents(getSeedApprovedReports(), limit);
}
