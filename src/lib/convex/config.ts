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

/** True on Vercel production deploys — never serve local Michigan seed data there. */
export function isProductionDeployment(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    process.env.VERCEL_ENV === "production"
  );
}

/** Local seed JSON is for dev only when Convex is not wired up. */
export function allowLocalSeedFallback(): boolean {
  return !isProductionDeployment();
}
