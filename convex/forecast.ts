import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import {
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { requireIdentity } from "./lib/auth";
import { FORECAST_PULSE_ENABLED } from "./lib/featureFlags";
import {
  analystTierFromStats,
  computeBullishPercent,
  confidencePoints,
  defaultClosesAt,
  forecastProfileToApi,
  marketToApi,
} from "./lib/forecastUtils";
import { reportToApi } from "./lib/mappers";
import {
  buildRisingBrands,
  buildTopFlowerThisWeek,
} from "./lib/scoreEngine";
import {
  forecastConfidence,
  forecastVoteChoice,
} from "./lib/intelligenceValidators";
import type { Doc, Id } from "./_generated/dataModel";

async function loadApprovedReports(ctx: QueryCtx) {
  const rows = await ctx.db
    .query("reports")
    .withIndex("by_status_created", (q) => q.eq("status", "approved"))
    .order("desc")
    .take(500);
  return rows.map(reportToApi);
}

async function getUserVote(
  ctx: QueryCtx,
  marketId: Id<"markets">,
  userId: string | null
) {
  if (!userId) return null;
  return await ctx.db
    .query("marketVotes")
    .withIndex("by_market_user", (q) =>
      q.eq("marketId", marketId).eq("userId", userId)
    )
    .unique();
}

async function ensureForecastProfile(ctx: MutationCtx, userId: string) {
  const existing = await ctx.db
    .query("forecastProfiles")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .unique();

  if (existing) return existing;

  const id = await ctx.db.insert("forecastProfiles", {
    userId,
    totalForecasts: 0,
    correctForecasts: 0,
    incorrectForecasts: 0,
    accuracyPercent: 0,
    forecastPoints: 0,
    analystTier: "rookie_analyst",
    updatedAt: Date.now(),
  });

  const created = await ctx.db.get(id);
  if (!created) throw new Error("Failed to create forecast profile");
  return created;
}

async function recordForecastParticipation(
  ctx: MutationCtx,
  userId: string,
  confidence: Doc<"marketVotes">["confidence"]
) {
  if (!FORECAST_PULSE_ENABLED) return;

  const profile = await ensureForecastProfile(ctx, userId);
  const points = confidencePoints(confidence);
  const total = profile.totalForecasts + 1;

  await ctx.db.patch(profile._id, {
    totalForecasts: total,
    forecastPoints: profile.forecastPoints + points,
    analystTier: analystTierFromStats(total, profile.accuracyPercent),
    updatedAt: Date.now(),
  });
}

export async function getBullishPercentForProduct(
  ctx: QueryCtx,
  productSlug: string
): Promise<number | null> {
  const market = await ctx.db
    .query("markets")
    .withIndex("by_product_status", (q) =>
      q.eq("productSlug", productSlug).eq("status", "open")
    )
    .order("desc")
    .first();

  if (!market || market.totalForecasts === 0) return null;
  return market.bullishPercent;
}

export const listActiveMarkets = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? null;

    const markets = await ctx.db
      .query("markets")
      .withIndex("by_status_closes", (q) => q.eq("status", "open"))
      .order("asc")
      .take(limit ?? 12);

    return Promise.all(
      markets.map(async (market) => {
        const userVote = await getUserVote(ctx, market._id, userId);
        return marketToApi(market, userVote);
      })
    );
  },
});

export const getMarket = query({
  args: { marketId: v.id("markets") },
  handler: async (ctx, { marketId }) => {
    const identity = await ctx.auth.getUserIdentity();
    const market = await ctx.db.get(marketId);
    if (!market) return null;
    const userVote = await getUserVote(
      ctx,
      marketId,
      identity?.subject ?? null
    );
    return marketToApi(market, userVote);
  },
});

export const getMarketsForProduct = query({
  args: { productSlug: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { productSlug, limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? null;

    const markets = await ctx.db
      .query("markets")
      .withIndex("by_product_status", (q) =>
        q.eq("productSlug", productSlug).eq("status", "open")
      )
      .take(limit ?? 3);

    return Promise.all(
      markets.map(async (market) => {
        const userVote = await getUserVote(ctx, market._id, userId);
        return marketToApi(market, userVote);
      })
    );
  },
});

export const getMarketsForBrand = query({
  args: { brandSlug: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { brandSlug, limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? null;

    const markets = await ctx.db
      .query("markets")
      .withIndex("by_brand_status", (q) =>
        q.eq("brandSlug", brandSlug).eq("status", "open")
      )
      .take(limit ?? 3);

    return Promise.all(
      markets.map(async (market) => {
        const userVote = await getUserVote(ctx, market._id, userId);
        return marketToApi(market, userVote);
      })
    );
  },
});

export const getMyForecastProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const profile = await ctx.db
      .query("forecastProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!profile) return null;

    const ranked = await ctx.db
      .query("forecastProfiles")
      .withIndex("by_points")
      .order("desc")
      .collect();

    const rank =
      ranked.findIndex((p) => p.userId === identity.subject) + 1 || 0;

    return forecastProfileToApi(profile, rank);
  },
});

export const getForecastStats = query({
  args: {},
  handler: async (ctx) => {
    const openMarkets = await ctx.db
      .query("markets")
      .withIndex("by_status_closes", (q) => q.eq("status", "open"))
      .collect();

    const totalForecasts = openMarkets.reduce(
      (sum, m) => sum + m.totalForecasts,
      0
    );

    const profiles = await ctx.db.query("forecastProfiles").collect();
    const allTimeForecasts = profiles.reduce(
      (sum, p) => sum + p.totalForecasts,
      0
    );

    return {
      active_markets: openMarkets.length,
      open_forecasts: totalForecasts,
      total_forecasts: allTimeForecasts + totalForecasts,
    };
  },
});

export const getTopAnalysts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const profiles = await ctx.db
      .query("forecastProfiles")
      .withIndex("by_points")
      .order("desc")
      .take(limit ?? 10);

    return profiles
      .filter((p) => p.totalForecasts >= 3)
      .map((p, i) => forecastProfileToApi(p, i + 1));
  },
});

export const voteOnMarket = mutation({
  args: {
    marketId: v.id("markets"),
    vote: forecastVoteChoice,
    confidence: forecastConfidence,
  },
  handler: async (ctx, args) => {
    if (!FORECAST_PULSE_ENABLED) {
      return { error: "Forecast Pulse is not enabled" };
    }

    const identity = await requireIdentity(ctx);
    const userId = identity.subject;

    const market = await ctx.db.get(args.marketId);
    if (!market) return { error: "Market not found" };
    if (market.status !== "open") return { error: "Market is closed" };
    if (Date.now() >= market.closesAt) return { error: "Market has closed" };

    const existing = await ctx.db
      .query("marketVotes")
      .withIndex("by_market_user", (q) =>
        q.eq("marketId", args.marketId).eq("userId", userId)
      )
      .unique();

    if (existing) return { error: "Already forecasted" };

    await ctx.db.insert("marketVotes", {
      marketId: args.marketId,
      userId,
      vote: args.vote,
      confidence: args.confidence,
      createdAt: Date.now(),
    });

    const yesCount = market.yesCount + (args.vote === "yes" ? 1 : 0);
    const noCount = market.noCount + (args.vote === "no" ? 1 : 0);
    const totalForecasts = market.totalForecasts + 1;

    await ctx.db.patch(args.marketId, {
      yesCount,
      noCount,
      totalForecasts,
      bullishPercent: computeBullishPercent(yesCount, noCount),
    });

    await recordForecastParticipation(ctx, userId, args.confidence);

    const updated = await ctx.db.get(args.marketId);
    const userVote = await getUserVote(ctx, args.marketId, userId);
    return {
      market: updated ? marketToApi(updated, userVote) : null,
    };
  },
});

async function hasOpenProductMarket(ctx: MutationCtx, productSlug: string) {
  const existing = await ctx.db
    .query("markets")
    .withIndex("by_product_status", (q) =>
      q.eq("productSlug", productSlug).eq("status", "open")
    )
    .first();
  return existing != null;
}

async function hasOpenBrandMarket(ctx: MutationCtx, brandSlug: string) {
  const existing = await ctx.db
    .query("markets")
    .withIndex("by_brand_status", (q) =>
      q.eq("brandSlug", brandSlug).eq("status", "open")
    )
    .first();
  return existing != null;
}

export const internalSeedMarkets = internalMutation({
  args: {},
  handler: async (ctx) => {
    if (!FORECAST_PULSE_ENABLED) return { seeded: 0 };

    const reports = await loadApprovedReports(ctx);
    const topFlower = buildTopFlowerThisWeek(reports).slice(0, 5);
    const risingBrands = buildRisingBrands(reports).slice(0, 3);
    let seeded = 0;
    const now = Date.now();

    for (const entry of topFlower) {
      if (await hasOpenProductMarket(ctx, entry.productSlug)) continue;

      await ctx.db.insert("markets", {
        question: `Will ${entry.productName} remain Top 10 next week?`,
        targetType: "product",
        productSlug: entry.productSlug,
        productName: entry.productName,
        brandSlug: entry.brandSlug,
        brandName: entry.brandName,
        status: "open",
        closesAt: defaultClosesAt(),
        yesCount: 0,
        noCount: 0,
        totalForecasts: 0,
        bullishPercent: 50,
        baselineRank: entry.rank,
        createdAt: now,
      });
      seeded += 1;
    }

    for (const entry of risingBrands) {
      if (await hasOpenBrandMarket(ctx, entry.brandSlug)) continue;

      await ctx.db.insert("markets", {
        question: `Will ${entry.brandName} gain momentum next week?`,
        targetType: "brand",
        brandSlug: entry.brandSlug,
        brandName: entry.brandName,
        status: "open",
        closesAt: defaultClosesAt(),
        yesCount: 0,
        noCount: 0,
        totalForecasts: 0,
        bullishPercent: 50,
        createdAt: now,
      });
      seeded += 1;
    }

    return { seeded };
  },
});

async function resolveMarket(
  ctx: MutationCtx,
  market: Doc<"markets">,
  outcome: boolean
) {
  const votes = await ctx.db
    .query("marketVotes")
    .withIndex("by_market_user", (q) => q.eq("marketId", market._id))
    .collect();

  for (const vote of votes) {
    const profile = await ensureForecastProfile(ctx, vote.userId);
    const correct = vote.vote === (outcome ? "yes" : "no");
    const correctCount = profile.correctForecasts + (correct ? 1 : 0);
    const incorrectCount = profile.incorrectForecasts + (correct ? 0 : 1);
    const resolved = correctCount + incorrectCount;
    const accuracy = resolved
      ? Math.round((correctCount / resolved) * 100)
      : profile.accuracyPercent;

    await ctx.db.patch(profile._id, {
      correctForecasts: correctCount,
      incorrectForecasts: incorrectCount,
      accuracyPercent: accuracy,
      forecastPoints:
        profile.forecastPoints + (correct ? confidencePoints(vote.confidence) : 0),
      analystTier: analystTierFromStats(profile.totalForecasts, accuracy),
      updatedAt: Date.now(),
    });
  }

  await ctx.db.patch(market._id, {
    status: "resolved",
    outcome,
    resolvedAt: Date.now(),
  });
}

export const internalResolveExpiredMarkets = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("markets")
      .withIndex("by_status_closes", (q) => q.eq("status", "open"))
      .filter((q) => q.lt(q.field("closesAt"), now))
      .collect();

    const reports = await loadApprovedReports(ctx);
    const topFlower = buildTopFlowerThisWeek(reports);
    const risingBrands = buildRisingBrands(reports);
    let resolved = 0;

    for (const market of expired) {
      let outcome = false;

      if (market.targetType === "product" && market.productSlug) {
        const current = topFlower.find(
          (e) => e.productSlug === market.productSlug
        );
        outcome = current != null && current.rank <= 10;
      } else if (market.targetType === "brand" && market.brandSlug) {
        const current = risingBrands.find(
          (e) => e.brandSlug === market.brandSlug
        );
        outcome = current != null && current.movement > 0;
      }

      await resolveMarket(ctx, market, outcome);
      resolved += 1;
    }

    return { resolved };
  },
});
