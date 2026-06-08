export function getConvexDeploymentUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL?.trim() ?? "";
  if (!url || url.includes("placeholder")) return null;
  return url;
}

export function isConvexConfigured(): boolean {
  return getConvexDeploymentUrl() !== null;
}

export function convexQueryOptions() {
  const url = getConvexDeploymentUrl();
  return url ? { url } : undefined;
}

export function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  return Boolean(key && !key.includes("placeholder"));
}

/** True on Vercel production deploys. */
export function isProductionDeployment(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    process.env.VERCEL_ENV === "production"
  );
}

/**
 * @deprecated Prefer resolveFeedList — seed data is always available as a
 * fallback when Convex returns empty results, including in production.
 */
export function allowLocalSeedFallback(): boolean {
  return true;
}
