/** Canonical public URL (www is primary on Vercel). */
export const CANONICAL_SITE_URL = "https://www.boofmap.com";

export const PRODUCTION_HOSTNAMES = ["www.boofmap.com", "boofmap.com"] as const;

export function normalizeSiteUrl(url: string): string {
  return url.replace(/\/$/, "");
}

export function isProductionHostname(hostname: string): boolean {
  return (PRODUCTION_HOSTNAMES as readonly string[]).includes(hostname);
}
