/** Enough live rows to treat the Convex feed as the real dataset. */
export const SPARSE_FEED_THRESHOLD = 8;

/** Prefer live Convex data; fall back to seed when live is empty, loading, or sparse. */
export function resolveFeedList<T>(
  live: T[] | undefined | null,
  seed: T[]
): T[] {
  if (!live?.length) return seed;
  if (live.length >= SPARSE_FEED_THRESHOLD) return live;
  return seed;
}
