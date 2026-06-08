import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
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
import {
  buildBiggestMovers,
  buildFallingBrands,
  buildFallingProducts,
  buildHotDrops,
  buildRisingBrands,
  buildTopFlowerThisWeek,
  buildValuePicks,
  type RankingEntry,
} from "./lib/scoreEngine";
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
    .take(500);
  return rows.map(reportToApi);
}

function movementToTrend(
  movement: number,
  score: number
): Doc<"rankings">["trend"] {
  if (movement > 0.3) return score >= 4 ? "hot" : "rising";
  if (movement < -0.3) return "falling";
  if (Math.abs(movement) > 0.8) return "volatile";
  return "steady";
}

function rankingEntryToRow(
  entry: RankingEntry,
  rankingTypeValue: Doc<"rankings">["rankingType"]
) {
  const isBrandRanking =
    rankingTypeValue === "rising_brands" ||
    rankingTypeValue === "falling_brands";

  return {
    productId: entry.productSlug,
    productName: isBrandRanking ? entry.brandName : entry.productName,
    brandName: entry.brandName,
    category: entry.productType,
    score: entry.score,
    previousScore: entry.previousScore,
    movement: entry.movement,
    reportCount: entry.reportCount,
    trend: movementToTrend(entry.movement, entry.score),
  };
}

function homeEntryToRow(
  entry: ReturnType<typeof buildRankings>[number],
  rankingTypeValue: Doc<"rankings">["rankingType"]
) {
  return {
    productId: entry.slug,
    productName: entry.name,
    brandName: entry.name,
    category: "brand",
    score: entry.score,
    previousScore: entry.change != null ? entry.score - entry.change : undefined,
    movement: entry.change ?? 0,
    reportCount: entry.report_count,
    trend: movementToTrend(entry.change ?? 0, entry.score),
  };
}

async function replaceRankingsForType(
  ctx: MutationCtx,
  rankingTypeValue: Doc<"rankings">["rankingType"],
  rows: Array<{
    productId?: string;
    productName: string;
    brandName?: string;
    category: string;
    score: number;
    previousScore?: number;
    movement: number;
    reportCount: number;
    trend: Doc<"rankings">["trend"];
  }>,
  now: number
) {
  const existing = await ctx.db
    .query("rankings")
    .withIndex("by_ranking_type_updated", (q) =>
      q.eq("rankingType", rankingTypeValue)
    )
    .collect();

  for (const row of existing) {
    await ctx.db.delete(row._id);
  }

  for (const row of rows) {
    await ctx.db.insert("rankings", {
      ...row,
      rankingType: rankingTypeValue,
      state: "MI",
      updatedAt: now,
    });
  }
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

export const internalRecalculateRankings = internalMutation({
  args: {},
  handler: async (ctx) => {
    const reports = await loadApprovedReports(ctx);
    const now = Date.now();

    const productRankingConfigs: Array<{
      type: Doc<"rankings">["rankingType"];
      entries: RankingEntry[];
    }> = [
      { type: "top_flower_week", entries: buildTopFlowerThisWeek(reports) },
      { type: "biggest_movers", entries: buildBiggestMovers(reports) },
      { type: "falling_products", entries: buildFallingProducts(reports) },
      { type: "hot_drops", entries: buildHotDrops(reports) },
      { type: "value_picks", entries: buildValuePicks(reports) },
      { type: "rising_brands", entries: buildRisingBrands(reports) },
      { type: "falling_brands", entries: buildFallingBrands(reports) },
    ];

    for (const { type, entries } of productRankingConfigs) {
      await replaceRankingsForType(
        ctx,
        type,
        entries.map((entry) => rankingEntryToRow(entry, type)),
        now
      );
    }

    const legacyHomeConfigs: Array<{
      homeType: HomeRankingType;
      dbType: Doc<"rankings">["rankingType"];
    }> = [
      { homeType: "fire_right_now", dbType: "fire" },
      { homeType: "biggest_fallers", dbType: "fallers" },
      { homeType: "most_reported", dbType: "reported" },
      { homeType: "budget_bargers", dbType: "budget" },
      { homeType: "fraud_watch", dbType: "fraud" },
    ];

    for (const { homeType, dbType } of legacyHomeConfigs) {
      const entries = buildRankings(reports, homeType);
      await replaceRankingsForType(
        ctx,
        dbType,
        entries.map((entry) => homeEntryToRow(entry, dbType)),
        now
      );
    }

    await ctx.scheduler.runAfter(0, internal.forecast.internalSeedMarkets, {});

    return {
      ok: true,
      updated_at: now,
      report_count: reports.length,
    };
  },
});

export const recalculateRankings = action({
  args: {},
  handler: async (
    ctx
  ): Promise<{
    ok: boolean;
    updated_at: number;
    report_count: number;
  }> => {
    await requireAdmin(ctx);
    return await ctx.runMutation(
      internal.rankings.internalRecalculateRankings,
      {}
    );
  },
});
