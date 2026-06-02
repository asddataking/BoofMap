/** Canonical public URL (www is primary on Vercel). */
export const CANONICAL_SITE_URL = "https://www.boofmap.com";

export const PRODUCTION_HOSTNAMES = ["www.boofmap.com", "boofmap.com"] as const;

export function normalizeSiteUrl(url: string): string {
  return url.replace(/\/$/, "");
}

/** True when `url` is a usable http(s) site URL (not a bare env key name). */
export function isValidPublicSiteUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function parsePublicSiteUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed || !isValidPublicSiteUrl(trimmed)) return null;
  return normalizeSiteUrl(trimmed);
}

export function isProductionHostname(hostname: string): boolean {
  return (PRODUCTION_HOSTNAMES as readonly string[]).includes(hostname);
}
