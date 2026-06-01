export function isConvexConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? "";
  return Boolean(url && !url.includes("placeholder"));
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
