import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { buildLeaderboardFromReports } from "./lib/intelligenceData";
import { reportToApi } from "./lib/mappers";
import { leaderboardCategory } from "./lib/intelligenceValidators";

export const getByCategory = query({
  args: {
    category: leaderboardCategory,
    state: v.optional(v.string()),
  },
  handler: async (ctx, { category }) => {
    const snapshot = await ctx.db
      .query("leaderboardSnapshots")
      .withIndex("by_category_updated", (q) => q.eq("category", category))
      .order("desc")
      .first();

    if (snapshot && snapshot.entries.length > 0) {
      return {
        id: snapshot._id as string,
        category: snapshot.category,
        entries: snapshot.entries,
        updated_at: new Date(snapshot.updatedAt).toISOString(),
      };
    }

    const reports = await ctx.db
      .query("reports")
      .withIndex("by_status_created", (q) => q.eq("status", "approved"))
      .collect();

    const entries = buildLeaderboardFromReports(
      reports.map(reportToApi),
      category
    );

    return {
      id: `computed-${category}`,
      category,
      entries,
      updated_at: new Date().toISOString(),
    };
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const categories = [
      "top_fire_products",
      "top_fire_brands",
      "top_value_products",
      "top_flower",
      "top_pre_rolls",
      "top_rosin",
      "top_concentrates",
    ] as const;

    const reports = await ctx.db
      .query("reports")
      .withIndex("by_status_created", (q) => q.eq("status", "approved"))
      .collect();

    const apiReports = reports.map(reportToApi);

    return categories.map((category) => ({
      category,
      entries: buildLeaderboardFromReports(apiReports, category),
      updated_at: new Date().toISOString(),
    }));
  },
});

export const saveSnapshot = mutation({
  args: {
    category: leaderboardCategory,
    state: v.optional(v.string()),
  },
  handler: async (ctx, { category, state }) => {
    await requireAdmin(ctx);
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_status_created", (q) => q.eq("status", "approved"))
      .collect();

    const entries = buildLeaderboardFromReports(
      reports.map(reportToApi),
      category
    );

    await ctx.db.insert("leaderboardSnapshots", {
      category,
      entries,
      state,
      updatedAt: Date.now(),
    });

    return { ok: true, count: entries.length };
  },
});
