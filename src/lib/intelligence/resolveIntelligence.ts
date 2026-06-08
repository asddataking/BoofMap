import { allowLocalSeedFallback } from "@/lib/convex/config";
import type { PlatformStats } from "./types";

export function resolvePlatformStats(
  live: PlatformStats | undefined,
  seed: PlatformStats,
  demo: PlatformStats
): PlatformStats {
  if (live && live.reports > 0) return live;
  if (allowLocalSeedFallback() && seed.reports > 0) return seed;
  return demo;
}

export function resolveRankingList<T>(
  live: T[] | undefined,
  seed: T[],
  demo: T[]
): T[] {
  if (live && live.length > 0) return live;
  if (allowLocalSeedFallback() && seed.length > 0) return seed;
  if (live === undefined) return demo;
  return demo;
}
