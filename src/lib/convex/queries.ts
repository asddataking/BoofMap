import { fetchQuery, preloadQuery } from "convex/nextjs";
import type { Preloaded } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { isConvexConfigured } from "./config";
import {
  getSeedApprovedMeetupReports,
  getSeedApprovedReports,
} from "./seed";
import type { MeetupReport, Report } from "@/lib/types";
import type { BrandProfile, DispensaryProfile } from "@/lib/types";
import type { RankingType } from "@/lib/types";
import { getBrandsFromReports } from "@/lib/data/reports";
import { slugify } from "@/lib/utils";

export async function preloadApprovedReports(): Promise<Preloaded<
  typeof api.reports.listApproved
> | null> {
  if (!isConvexConfigured()) return null;
  return preloadQuery(api.reports.listApproved, {});
}

export async function preloadApprovedMeetupReports(): Promise<Preloaded<
  typeof api.meetupReports.listFeed
> | null> {
  if (!isConvexConfigured()) return null;
  return preloadQuery(api.meetupReports.listFeed, {});
}

export async function fetchApprovedReports(): Promise<Report[]> {
  if (!isConvexConfigured()) return getSeedApprovedReports();
  return (await fetchQuery(api.reports.listApproved, {})) as Report[];
}

export async function fetchApprovedMeetupReports(): Promise<MeetupReport[]> {
  if (!isConvexConfigured()) return getSeedApprovedMeetupReports();
  return (await fetchQuery(api.meetupReports.listFeed, {})) as MeetupReport[];
}

export async function fetchBrandNames(): Promise<string[]> {
  if (!isConvexConfigured()) {
    return getBrandsFromReports(getSeedApprovedReports());
  }
  return fetchQuery(api.reports.listBrandNames, {});
}

export async function fetchBrandProfile(
  slug: string
): Promise<BrandProfile | null> {
  if (!isConvexConfigured()) {
    const { getBrandProfileFromReports } = await import(
      "@/lib/data/profileFallback"
    );
    return getBrandProfileFromReports(slug, getSeedApprovedReports());
  }
  return (await fetchQuery(api.reports.getBrandProfile, { slug })) as BrandProfile | null;
}

export async function fetchDispensaryProfile(
  slug: string
): Promise<DispensaryProfile | null> {
  if (!isConvexConfigured()) {
    const { getDispensaryProfileFromReports } = await import(
      "@/lib/data/profileFallback"
    );
    return getDispensaryProfileFromReports(slug, getSeedApprovedReports());
  }
  return (await fetchQuery(api.reports.getDispensaryProfile, {
    slug,
  })) as DispensaryProfile | null;
}

export async function preloadTickerItems(): Promise<Preloaded<
  typeof api.ticker.listActiveTickerItems
> | null> {
  if (!isConvexConfigured()) return null;
  return preloadQuery(api.ticker.listActiveTickerItems, {});
}

export async function preloadRankings(
  type: RankingType
): Promise<Preloaded<typeof api.rankings.listRankingsByType> | null> {
  if (!isConvexConfigured()) return null;
  return preloadQuery(api.rankings.listRankingsByType, { type });
}
