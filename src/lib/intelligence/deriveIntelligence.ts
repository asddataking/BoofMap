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

export function reportToIntelligenceRow(report: Report): ReportRow {
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

function toRows(reports: Report[]): ReportRow[] {
  return reports.map(reportToIntelligenceRow);
}

export function derivePlatformStats(reports: Report[]): PlatformStats {
  const rows = toRows(reports);
  if (!rows.length) {
    return { reports: 0, products: 0, brands: 0, active_users: 0 };
  }

  const productSlugs = new Set<string>();
  const brandSlugs = new Set<string>();

  for (const report of rows) {
    productSlugs.add(slugify(`${report.strain_name}-${report.brand_name}`));
    brandSlugs.add(slugify(report.brand_name));
  }

  return {
    reports: rows.length,
    products: productSlugs.size,
    brands: brandSlugs.size,
    active_users: Math.max(1, Math.round(rows.length * 0.6)),
  };
}

export function deriveTopFlower(
  reports: Report[],
  limit = 10
): IntelligenceRankingEntry[] {
  return buildTopFlowerThisWeek(toRows(reports))
    .slice(0, limit)
    .map(rankingEntryToApi);
}

export function deriveBiggestMovers(
  reports: Report[],
  limit = 8
): IntelligenceRankingEntry[] {
  return buildBiggestMovers(toRows(reports))
    .slice(0, limit)
    .map(rankingEntryToApi);
}

export function deriveFallingProducts(
  reports: Report[],
  limit = 8
): IntelligenceRankingEntry[] {
  return buildFallingProducts(toRows(reports))
    .slice(0, limit)
    .map(rankingEntryToApi);
}

export function deriveHotDrops(
  reports: Report[],
  limit = 8
): IntelligenceRankingEntry[] {
  return buildHotDrops(toRows(reports))
    .slice(0, limit)
    .map(rankingEntryToApi);
}

export function deriveValuePicks(
  reports: Report[],
  limit = 8
): IntelligenceRankingEntry[] {
  return buildValuePicks(toRows(reports))
    .slice(0, limit)
    .map(rankingEntryToApi);
}

export function deriveRisingBrands(
  reports: Report[],
  limit = 6
): IntelligenceRankingEntry[] {
  return buildRisingBrands(toRows(reports))
    .slice(0, limit)
    .map(rankingEntryToApi);
}

export function deriveFallingBrands(
  reports: Report[],
  limit = 6
): IntelligenceRankingEntry[] {
  return buildFallingBrands(toRows(reports))
    .slice(0, limit)
    .map(rankingEntryToApi);
}

export function deriveSignalEvents(
  reports: Report[],
  limit = 20
): SignalEvent[] {
  const rows = toRows(reports);
  if (!rows.length) return [];

  return buildSignalEventsFromReports(rows).slice(0, limit).map((event, i) => ({
    id: `derived-signal-${i}`,
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
