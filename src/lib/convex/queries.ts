import { fetchQuery, preloadQuery } from "convex/nextjs";
import type { Preloaded } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  allowLocalSeedFallback,
  convexQueryOptions,
  isConvexConfigured,
} from "./config";
import {
  getSeedApprovedMeetupReports,
  getSeedApprovedReports,
} from "./seed";
import type { MeetupReport, Report } from "@/lib/types";
import type { BrandProfile, DispensaryProfile } from "@/lib/types";
import type { ProductIntelligence, ProductProfile } from "@/lib/intelligence/types";
import type { RankingType } from "@/lib/types";
import { getBrandsFromReports } from "@/lib/data/reports";

function logConvexQueryFailure(label: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[convex] ${label} failed:`, message || error);
}

export async function preloadApprovedReports(): Promise<Preloaded<
  typeof api.reports.listApproved
> | null> {
  const options = convexQueryOptions();
  if (!options) return null;
  try {
    return await preloadQuery(api.reports.listApproved, {}, options);
  } catch (error) {
    logConvexQueryFailure("preloadApprovedReports", error);
    return null;
  }
}

export async function preloadApprovedMeetupReports(): Promise<Preloaded<
  typeof api.meetupReports.listApproved
> | null> {
  const options = convexQueryOptions();
  if (!options) return null;
  try {
    return await preloadQuery(api.meetupReports.listApproved, {}, options);
  } catch (error) {
    logConvexQueryFailure("preloadApprovedMeetupReports", error);
    return null;
  }
}

export async function fetchApprovedReports(): Promise<Report[]> {
  if (!isConvexConfigured()) {
    return allowLocalSeedFallback() ? getSeedApprovedReports() : [];
  }
  const options = convexQueryOptions();
  if (!options) return [];
  try {
    return (await fetchQuery(api.reports.listApproved, {}, options)) as Report[];
  } catch (error) {
    logConvexQueryFailure("fetchApprovedReports", error);
    return allowLocalSeedFallback() ? getSeedApprovedReports() : [];
  }
}

export async function fetchApprovedMeetupReports(): Promise<MeetupReport[]> {
  if (!isConvexConfigured()) {
    return allowLocalSeedFallback() ? getSeedApprovedMeetupReports() : [];
  }
  const options = convexQueryOptions();
  if (!options) return [];
  try {
    return (await fetchQuery(
      api.meetupReports.listApproved,
      {},
      options
    )) as MeetupReport[];
  } catch (error) {
    logConvexQueryFailure("fetchApprovedMeetupReports", error);
    return allowLocalSeedFallback() ? getSeedApprovedMeetupReports() : [];
  }
}

export async function fetchBrandNames(): Promise<string[]> {
  if (!isConvexConfigured()) {
    if (!allowLocalSeedFallback()) return [];
    return getBrandsFromReports(getSeedApprovedReports());
  }
  const options = convexQueryOptions();
  if (!options) return [];
  try {
    return await fetchQuery(api.reports.listBrandNames, {}, options);
  } catch (error) {
    logConvexQueryFailure("fetchBrandNames", error);
    if (!allowLocalSeedFallback()) return [];
    return getBrandsFromReports(getSeedApprovedReports());
  }
}

export async function fetchBrandProfile(
  slug: string
): Promise<BrandProfile | null> {
  if (!isConvexConfigured()) {
    if (!allowLocalSeedFallback()) return null;
    const { getBrandProfileFromReports } = await import(
      "@/lib/data/profileFallback"
    );
    return getBrandProfileFromReports(slug, getSeedApprovedReports());
  }
  const options = convexQueryOptions();
  if (!options) return null;
  try {
    return (await fetchQuery(
      api.reports.getBrandProfile,
      { slug },
      options
    )) as BrandProfile | null;
  } catch (error) {
    logConvexQueryFailure("fetchBrandProfile", error);
    if (!allowLocalSeedFallback()) return null;
    const { getBrandProfileFromReports } = await import(
      "@/lib/data/profileFallback"
    );
    return getBrandProfileFromReports(slug, getSeedApprovedReports());
  }
}

export async function fetchDispensaryProfile(
  slug: string
): Promise<DispensaryProfile | null> {
  if (!isConvexConfigured()) {
    if (!allowLocalSeedFallback()) return null;
    const { getDispensaryProfileFromReports } = await import(
      "@/lib/data/profileFallback"
    );
    return getDispensaryProfileFromReports(slug, getSeedApprovedReports());
  }
  const options = convexQueryOptions();
  if (!options) return null;
  try {
    return (await fetchQuery(
      api.reports.getDispensaryProfile,
      { slug },
      options
    )) as DispensaryProfile | null;
  } catch (error) {
    logConvexQueryFailure("fetchDispensaryProfile", error);
    if (!allowLocalSeedFallback()) return null;
    const { getDispensaryProfileFromReports } = await import(
      "@/lib/data/profileFallback"
    );
    return getDispensaryProfileFromReports(slug, getSeedApprovedReports());
  }
}

export async function preloadTickerItems(): Promise<Preloaded<
  typeof api.ticker.listActiveTickerItems
> | null> {
  const options = convexQueryOptions();
  if (!options) return null;
  try {
    return await preloadQuery(api.ticker.listActiveTickerItems, {}, options);
  } catch (error) {
    logConvexQueryFailure("preloadTickerItems", error);
    return null;
  }
}

export async function preloadRankings(
  type: RankingType
): Promise<Preloaded<typeof api.rankings.listRankingsByType> | null> {
  const options = convexQueryOptions();
  if (!options) return null;
  try {
    return await preloadQuery(api.rankings.listRankingsByType, { type }, options);
  } catch (error) {
    logConvexQueryFailure("preloadRankings", error);
    return null;
  }
}

export async function fetchProductScore(productSlug: string) {
  if (!isConvexConfigured()) return null;
  const options = convexQueryOptions();
  if (!options) return null;
  try {
    return await fetchQuery(
      api.intelligence.getProductScore,
      { productSlug },
      options
    );
  } catch (error) {
    logConvexQueryFailure("fetchProductScore", error);
    return null;
  }
}

export async function fetchProductIntelligence(
  productSlug: string
): Promise<ProductIntelligence | null> {
  if (!isConvexConfigured()) {
    if (!allowLocalSeedFallback()) return null;
    const { getProductProfileFromReports } = await import(
      "@/lib/data/profileFallback"
    );
    const profile = getProductProfileFromReports(
      productSlug,
      getSeedApprovedReports()
    );
    if (!profile) return null;
    const { recent_reports: _, ...intelligence } = profile;
    return intelligence;
  }
  const options = convexQueryOptions();
  if (!options) return null;
  try {
    return (await fetchQuery(
      api.intelligence.getProductIntelligence,
      { productSlug },
      options
    )) as ProductIntelligence | null;
  } catch (error) {
    logConvexQueryFailure("fetchProductIntelligence", error);
    if (!allowLocalSeedFallback()) return null;
    const { getProductProfileFromReports } = await import(
      "@/lib/data/profileFallback"
    );
    const profile = getProductProfileFromReports(
      productSlug,
      getSeedApprovedReports()
    );
    if (!profile) return null;
    const { recent_reports: _, ...intelligence } = profile;
    return intelligence;
  }
}

export async function fetchProductProfile(
  productSlug: string
): Promise<ProductProfile | null> {
  if (!isConvexConfigured()) {
    if (!allowLocalSeedFallback()) return null;
    const { getProductProfileFromReports } = await import(
      "@/lib/data/profileFallback"
    );
    return getProductProfileFromReports(
      productSlug,
      getSeedApprovedReports()
    );
  }
  const options = convexQueryOptions();
  if (!options) return null;
  try {
    return (await fetchQuery(
      api.intelligence.getProductProfile,
      { productSlug },
      options
    )) as ProductProfile | null;
  } catch (error) {
    logConvexQueryFailure("fetchProductProfile", error);
    if (!allowLocalSeedFallback()) return null;
    const { getProductProfileFromReports } = await import(
      "@/lib/data/profileFallback"
    );
    return getProductProfileFromReports(
      productSlug,
      getSeedApprovedReports()
    );
  }
}
