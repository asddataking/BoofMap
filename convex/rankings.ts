import { v } from "convex/values";
import type { QueryCtx } from "./_generated/server";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireAdmin } from "./lib/auth";
import {
  buildMarketMovers,
  buildRankings,
  type RankingType as HomeRankingType,
} from "./lib/homeData";
import { rankingToApi, reportToApi } from "./lib/mappers";
import { slugify } from "./lib/slugify";
import { rankingTrend, rankingType } from "./lib/validators";
import type { Doc } from "./_generated/dataModel";

const homeRankingType = v.union(
  v.literal("fire_right_now"),
  v.literal("biggest_fallers"),
  v.literal("most_reported"),
  v.literal("budget_bargers"),
  v.literal("fraud_watch")
);

const HOME_TO_DB: Record<HomeRankingType, Doc<"rankings">["rankingType"]> = {
  fire_right_now: "fire",
  biggest_fallers: "fallers",
  most_reported: "reported",
  budget_bargers: "budget",
  fraud_watch: "fraud",
};

function storedRankingToHomeEntry(r: Doc<"rankings">, rank: number) {
  const name = r.brandName ?? r.productName;
  return {
    id: slugify(`${name}-${r.productName}`),
    rank,
    name,
    subtitle: `${r.reportCount} reports · ${r.productName}`,
    score: Math.round(r.score * 10) / 10,
    change: r.movement,
    report_count: r.reportCount,
    slug: slugify(name),
    kind: "brand" as const,
  };
}

async function loadApprovedReports(ctx: QueryCtx) {
  const rows = await ctx.db
    .query("reports")
    .withIndex("by_status_created", (q) => q.eq("status", "approved"))
    .order("desc")
    .take(200);
  return rows.map(reportToApi);
}

export const listRankingsByType = query({
  args: {
    type: v.optional(homeRankingType),
    rankingType: v.optional(rankingType),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const dbType =
      args.rankingType ??
      (args.type ? HOME_TO_DB[args.type as HomeRankingType] : "fire");
    const limit = args.limit ?? 25;

    const stored = await ctx.db
      .query("rankings")
      .withIndex("by_ranking_type_score", (q) => q.eq("rankingType", dbType))
      .order("desc")
      .take(limit);

    if (stored.length > 0) {
      return stored.map((r, i) => storedRankingToHomeEntry(r, i + 1));
    }

    const homeType =
      args.type ??
      (Object.entries(HOME_TO_DB).find(([, v]) => v === dbType)?.[0] as
        | HomeRankingType
        | undefined) ??
      "fire_right_now";

    const reports = await loadApprovedReports(ctx);
    return buildRankings(reports, homeType);
  },
});

export const listStoredRankings = query({
  args: {
    rankingType: rankingType,
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { rankingType, limit }) => {
    const rows = await ctx.db
      .query("rankings")
      .withIndex("by_ranking_type_score", (q) => q.eq("rankingType", rankingType))
      .order("desc")
      .take(limit ?? 25);

    return rows.map(rankingToApi);
  },
});

export const getMarketMovers = query({
  args: {},
  handler: async (ctx) => {
    const reports = await loadApprovedReports(ctx);
    return buildMarketMovers(reports);
  },
});

export const upsertRanking = mutation({
  args: {
    productId: v.optional(v.string()),
    productName: v.string(),
    brandName: v.optional(v.string()),
    category: v.string(),
    state: v.optional(v.string()),
    score: v.number(),
    previousScore: v.optional(v.number()),
    movement: v.number(),
    reportCount: v.number(),
    rankingType: rankingType,
    trend: rankingTrend,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();
    const productName = args.productName.trim();
    const brandName = args.brandName?.trim();
    const candidates = await ctx.db
      .query("rankings")
      .withIndex("by_ranking_type_updated", (q) =>
        q.eq("rankingType", args.rankingType)
      )
      .collect();
    const existing = candidates.find(
      (r) =>
        r.productName === productName &&
        (r.brandName ?? "") === (brandName ?? "")
    );

    const doc = {
      productId: args.productId,
      productName,
      brandName,
      category: args.category.trim(),
      state: args.state?.trim() ?? "MI",
      score: args.score,
      previousScore: args.previousScore,
      movement: args.movement,
      reportCount: args.reportCount,
      rankingType: args.rankingType,
      trend: args.trend,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, doc);
      const updated = await ctx.db.get(existing._id);
      return updated ? rankingToApi(updated) : null;
    }

    const id = await ctx.db.insert("rankings", doc);
    const created = await ctx.db.get(id);
    return created ? rankingToApi(created) : null;
  },
});

export const recalculateRankings = action({
  args: {},
  handler: async (ctx) => {
    // TODO: Aggregate approved reports by brand/product/category and upsert rankings.
    await ctx.runMutation(internal.rankings.internalRecalculatePlaceholder, {});
    return {
      ok: true,
      message: "Placeholder recalculation — implement report aggregation",
    };
  },
});

export const internalRecalculatePlaceholder = internalMutation({
  args: {},
  handler: async () => {
    // TODO: wire real aggregation from reports table
  },
});
