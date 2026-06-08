/** Prefer live Convex data; fall back to local seed when live is empty or still loading. */
export function resolveFeedList<T>(
  live: T[] | undefined | null,
  seed: T[]
): T[] {
  if (live && live.length > 0) return live;
  return seed;
}
