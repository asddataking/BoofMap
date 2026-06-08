import { getSeedApprovedReports } from "@/lib/convex/seed";
import { allowLocalSeedFallback } from "@/lib/convex/config";
import type { Report } from "@/lib/types";
import { slugify } from "@/lib/utils";
import {
  buildBiggestMovers,
  buildFallingBrands,
  buildFallingProducts,
  buildHotDrops,
  buildRisingBrands,
  buildTopFlowerThisWeek,
  buildValuePicks,
  type RankingEntry,
} from "../../../convex/lib/scoreEngine";
import { buildSignalEventsFromReports } from "../../../convex/lib/intelligenceData";
import type {
  IntelligenceRankingEntry,
  PlatformStats,
  SignalEvent,
} from "./types";

type ReportRow = {
  id: string;
  brand_name: string;
  strain_name: string;
  city: string;
  boof_score: number;
  price_paid?: number | null;
  package_date?: string | null;
  issue_tags: string[];
  confirm_count?: number;
  product_type: string;
  created_at: string;
};

function reportToRow(report: Report): ReportRow {
  return {
    id: report.id,
    brand_name: report.brand_name,
    strain_name: report.strain_name,
    city: report.city,
    boof_score: report.boof_score,
    price_paid: report.price_paid,
    package_date: report.package_date,
    issue_tags: report.issue_tags,
    confirm_count: report.confirm_count,
    product_type: report.product_type,
    created_at: report.created_at,
  };
}

function rankingEntryToApi(entry: RankingEntry): IntelligenceRankingEntry {
  return {
    id: entry.id,
    rank: entry.rank,
    product_name: entry.productName,
    brand_name: entry.brandName,
    brand_slug: entry.brandSlug,
    product_slug: entry.productSlug,
    score: entry.score,
    previous_score: entry.previousScore ?? null,
    movement: entry.movement,
    report_count: entry.reportCount,
    price_per_gram: entry.pricePerGram ?? null,
    product_type: entry.productType,
  };
}

function getSeedReportRows(): ReportRow[] {
  if (!allowLocalSeedFallback()) return [];
  return getSeedApprovedReports().map(reportToRow);
}

export function getSeedPlatformStats(): PlatformStats {
  const reports = getSeedReportRows();
  if (!reports.length) {
    return { reports: 0, products: 0, brands: 0, active_users: 0 };
  }

  const productSlugs = new Set<string>();
  const brandSlugs = new Set<string>();

  for (const report of reports) {
    productSlugs.add(slugify(`${report.strain_name}-${report.brand_name}`));
    brandSlugs.add(slugify(report.brand_name));
  }

  return {
    reports: reports.length,
    products: productSlugs.size,
    brands: brandSlugs.size,
    active_users: Math.max(1, Math.round(reports.length * 0.6)),
  };
}

export function getSeedTopFlower(limit = 10): IntelligenceRankingEntry[] {
  return buildTopFlowerThisWeek(getSeedReportRows())
    .slice(0, limit)
    .map(rankingEntryToApi);
}

export function getSeedBiggestMovers(limit = 8): IntelligenceRankingEntry[] {
  return buildBiggestMovers(getSeedReportRows())
    .slice(0, limit)
    .map(rankingEntryToApi);
}

export function getSeedFallingProducts(limit = 8): IntelligenceRankingEntry[] {
  return buildFallingProducts(getSeedReportRows())
    .slice(0, limit)
    .map(rankingEntryToApi);
}

export function getSeedHotDrops(limit = 8): IntelligenceRankingEntry[] {
  return buildHotDrops(getSeedReportRows())
    .slice(0, limit)
    .map(rankingEntryToApi);
}

export function getSeedValuePicks(limit = 8): IntelligenceRankingEntry[] {
  return buildValuePicks(getSeedReportRows())
    .slice(0, limit)
    .map(rankingEntryToApi);
}

export function getSeedRisingBrands(limit = 6): IntelligenceRankingEntry[] {
  return buildRisingBrands(getSeedReportRows())
    .slice(0, limit)
    .map(rankingEntryToApi);
}

export function getSeedFallingBrands(limit = 6): IntelligenceRankingEntry[] {
  return buildFallingBrands(getSeedReportRows())
    .slice(0, limit)
    .map(rankingEntryToApi);
}

export function getSeedSignalEvents(limit = 20): SignalEvent[] {
  const rows = getSeedReportRows();
  if (!rows.length) return [];

  return buildSignalEventsFromReports(rows).slice(0, limit).map((event, i) => ({
    id: `seed-signal-${i}`,
    type: event.type as SignalEvent["type"],
    title: event.title,
    detail: event.detail ?? null,
    brand_name: event.brandName ?? null,
    product_name: event.productName ?? null,
    city: event.city ?? null,
    state: "MI",
    movement: event.movement ?? null,
    severity: null,
    created_at: new Date().toISOString(),
  }));
}
