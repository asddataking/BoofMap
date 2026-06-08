import { v } from "convex/values";
import type { QueryCtx } from "./_generated/server";
import { query } from "./_generated/server";
import { reportToApi } from "./lib/mappers";
import { slugify } from "./lib/slugify";
import {
  buildBiggestMovers,
  buildFallingBrands,
  buildHotDrops,
  buildRisingBrands,
  buildTopFlowerThisWeek,
  buildValuePicks,
  findProductScores,
  type RankingEntry,
} from "./lib/scoreEngine";

async function loadApprovedReports(ctx: QueryCtx) {
  const rows = await ctx.db
    .query("reports")
    .withIndex("by_status_created", (q) => q.eq("status", "approved"))
    .order("desc")
    .take(500);
  return rows.map(reportToApi);
}

function rankingToApi(entry: RankingEntry) {
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

export const getPlatformStats = query({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect();

    const productSlugs = new Set<string>();
    const brandSlugs = new Set<string>();
    const activeUserIds = new Set<string>();

    for (const r of reports) {
      productSlugs.add(slugify(`${r.strainName}-${r.brandName}`));
      brandSlugs.add(slugify(r.brandName));
      activeUserIds.add(r.userId);
    }

    return {
      reports: reports.length,
      products: productSlugs.size,
      brands: brandSlugs.size,
      active_users: activeUserIds.size,
    };
  },
});

export const getTopFlowerThisWeek = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const reports = await loadApprovedReports(ctx);
    return buildTopFlowerThisWeek(reports)
      .slice(0, limit ?? 10)
      .map(rankingToApi);
  },
});

export const getBiggestMovers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const reports = await loadApprovedReports(ctx);
    return buildBiggestMovers(reports)
      .slice(0, limit ?? 8)
      .map(rankingToApi);
  },
});

export const getHotDrops = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const reports = await loadApprovedReports(ctx);
    return buildHotDrops(reports).slice(0, limit ?? 8).map(rankingToApi);
  },
});

export const getValuePicks = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const reports = await loadApprovedReports(ctx);
    return buildValuePicks(reports).slice(0, limit ?? 8).map(rankingToApi);
  },
});

export const getRisingBrands = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const reports = await loadApprovedReports(ctx);
    return buildRisingBrands(reports).slice(0, limit ?? 6).map(rankingToApi);
  },
});

export const getFallingBrands = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const reports = await loadApprovedReports(ctx);
    return buildFallingBrands(reports).slice(0, limit ?? 6).map(rankingToApi);
  },
});

export const getProductScore = query({
  args: { productSlug: v.string() },
  handler: async (ctx, { productSlug }) => {
    const stored = await ctx.db
      .query("productScores")
      .withIndex("by_product_slug", (q) => q.eq("productSlug", productSlug))
      .unique();

    if (stored) {
      return {
        product_name: stored.productName,
        brand_name: stored.brandName,
        community_score: stored.communityScore ?? stored.trustScore,
        flavor_score: stored.flavorScore ?? Math.round(stored.fireScore * 20),
        burn_score: stored.burnScore ?? Math.round(stored.fireScore * 18),
        value_score: stored.valueScore,
        freshness_score: stored.freshnessScore ?? 0,
        report_count: stored.reportCount,
      };
    }

    const reports = await loadApprovedReports(ctx);
    const computed = findProductScores(reports, productSlug);
    if (!computed) return null;

    return {
      product_name: computed.productName,
      brand_name: computed.brandName,
      community_score: computed.communityScore,
      flavor_score: computed.flavorScore,
      burn_score: computed.burnScore,
      value_score: computed.valueScore,
      freshness_score: computed.freshnessScore,
      report_count: computed.reportCount,
    };
  },
});

export const getHomepageIntelligence = query({
  args: {},
  handler: async (ctx) => {
    const reports = await loadApprovedReports(ctx);

    const stats = {
      reports: reports.length,
      products: new Set(
        reports.map((r) => slugify(`${r.strain_name}-${r.brand_name}`))
      ).size,
      brands: new Set(reports.map((r) => slugify(r.brand_name))).size,
      active_users: new Set(reports.map((r) => r.user_id).filter(Boolean)).size,
    };

    return {
      stats,
      top_flower: buildTopFlowerThisWeek(reports).map(rankingToApi),
      biggest_movers: buildBiggestMovers(reports).map(rankingToApi),
      hot_drops: buildHotDrops(reports).map(rankingToApi),
      value_picks: buildValuePicks(reports).map(rankingToApi),
      rising_brands: buildRisingBrands(reports).map(rankingToApi),
      falling_brands: buildFallingBrands(reports).map(rankingToApi),
    };
  },
});
