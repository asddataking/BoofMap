import { v } from "convex/values";
import type { QueryCtx } from "./_generated/server";
import { query } from "./_generated/server";
import { getBullishPercentForProduct } from "./forecast";
import { reportToApi } from "./lib/mappers";
import { slugify } from "./lib/slugify";
import {
  buildBiggestMovers,
  buildFallingBrands,
  buildFallingProducts,
  buildHotDrops,
  buildRisingBrands,
  buildTopFlowerThisWeek,
  buildValuePicks,
  computeProductMomentum,
  computeTrendDirection,
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

export const getFallingProducts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const reports = await loadApprovedReports(ctx);
    return buildFallingProducts(reports)
      .slice(0, limit ?? 8)
      .map(rankingToApi);
  },
});

async function productScorePayload(
  ctx: QueryCtx,
  productSlug: string,
  reports: Awaited<ReturnType<typeof loadApprovedReports>>,
  stored?: {
    productName: string;
    brandName: string;
    brandSlug: string;
    productType: string;
    communityScore?: number;
    trustScore: number;
    flavorScore?: number;
    fireScore: number;
    burnScore?: number;
    valueScore: number;
    freshnessScore?: number;
    reportCount: number;
  } | null
) {
  const momentum = computeProductMomentum(reports, productSlug);
  const trendDirection = computeTrendDirection(momentum.movement);
  const forecastBullishPercent = await getBullishPercentForProduct(
    ctx,
    productSlug
  );

  if (stored) {
    return {
      product_slug: productSlug,
      product_name: stored.productName,
      brand_name: stored.brandName,
      brand_slug: stored.brandSlug,
      product_type: stored.productType,
      community_score: stored.communityScore ?? stored.trustScore,
      flavor_score: stored.flavorScore ?? Math.round(stored.fireScore * 20),
      burn_score: stored.burnScore ?? Math.round(stored.fireScore * 18),
      value_score: stored.valueScore,
      freshness_score: stored.freshnessScore ?? 0,
      report_count: stored.reportCount,
      movement: Math.round(momentum.movement * 10) / 10,
      trend_direction: trendDirection,
      avg_boof_score: momentum.currentScore,
      forecast_bullish_percent: forecastBullishPercent,
    };
  }

  const computed = findProductScores(reports, productSlug);
  if (!computed) return null;

  const productReports = reports.filter(
    (r) => slugify(`${r.strain_name}-${r.brand_name}`) === productSlug
  );

  return {
    product_slug: productSlug,
    product_name: computed.productName,
    brand_name: computed.brandName,
    brand_slug: slugify(computed.brandName),
    product_type: productReports[0]?.product_type ?? "flower",
    community_score: computed.communityScore,
    flavor_score: computed.flavorScore,
    burn_score: computed.burnScore,
    value_score: computed.valueScore,
    freshness_score: computed.freshnessScore,
    report_count: computed.reportCount,
    movement: Math.round(momentum.movement * 10) / 10,
    trend_direction: trendDirection,
    avg_boof_score: momentum.currentScore,
    forecast_bullish_percent: forecastBullishPercent,
  };
}

export const getProductScore = query({
  args: { productSlug: v.string() },
  handler: async (ctx, { productSlug }) => {
    const reports = await loadApprovedReports(ctx);
    const stored = await ctx.db
      .query("productScores")
      .withIndex("by_product_slug", (q) => q.eq("productSlug", productSlug))
      .unique();

    const payload = await productScorePayload(ctx, productSlug, reports, stored);
    if (!payload) return null;

    return {
      product_name: payload.product_name,
      brand_name: payload.brand_name,
      community_score: payload.community_score,
      flavor_score: payload.flavor_score,
      burn_score: payload.burn_score,
      value_score: payload.value_score,
      freshness_score: payload.freshness_score,
      report_count: payload.report_count,
    };
  },
});

export const getProductIntelligence = query({
  args: { productSlug: v.string() },
  handler: async (ctx, { productSlug }) => {
    const reports = await loadApprovedReports(ctx);
    const stored = await ctx.db
      .query("productScores")
      .withIndex("by_product_slug", (q) => q.eq("productSlug", productSlug))
      .unique();

    return await productScorePayload(ctx, productSlug, reports, stored);
  },
});

export const getProductProfile = query({
  args: { productSlug: v.string() },
  handler: async (ctx, { productSlug }) => {
    const reports = await loadApprovedReports(ctx);
    const stored = await ctx.db
      .query("productScores")
      .withIndex("by_product_slug", (q) => q.eq("productSlug", productSlug))
      .unique();

    const payload = await productScorePayload(ctx, productSlug, reports, stored);
    if (!payload) return null;

    const productReports = reports.filter(
      (r) => slugify(`${r.strain_name}-${r.brand_name}`) === productSlug
    );

    return {
      ...payload,
      recent_reports: productReports.slice(0, 10),
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
      falling_products: buildFallingProducts(reports).map(rankingToApi),
    };
  },
});
