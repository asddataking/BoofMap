import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { buildWeeklyMarketReport } from "./lib/intelligenceData";
import { reportToApi } from "./lib/mappers";

function reportToApiShape(r: {
  _id: string;
  weekStart: string;
  weekEnd: string;
  state: string;
  mostImprovedBrand: string;
  mostTrustedBrand: string;
  hottestProduct: string;
  mostActiveCity: string;
  bestValueProduct: string;
  biggestBoofAlert: string;
  publishedAt: number;
}) {
  return {
    id: r._id as string,
    week_start: r.weekStart,
    week_end: r.weekEnd,
    state: r.state,
    most_improved_brand: r.mostImprovedBrand,
    most_trusted_brand: r.mostTrustedBrand,
    hottest_product: r.hottestProduct,
    most_active_city: r.mostActiveCity,
    best_value_product: r.bestValueProduct,
    biggest_boof_alert: r.biggestBoofAlert,
    published_at: new Date(r.publishedAt).toISOString(),
  };
}

export const getLatest = query({
  args: { state: v.optional(v.string()) },
  handler: async (ctx, { state }) => {
    const targetState = state ?? "MI";
    const stored = await ctx.db
      .query("marketReports")
      .withIndex("by_state_published", (q) => q.eq("state", targetState))
      .order("desc")
      .first();

    if (stored) {
      return reportToApiShape(stored);
    }

    const reports = await ctx.db
      .query("reports")
      .withIndex("by_status_created", (q) => q.eq("status", "approved"))
      .collect();

    return buildWeeklyMarketReport(reports.map(reportToApi), targetState);
  },
});

export const listPublished = query({
  args: { state: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, { state, limit }) => {
    const targetState = state ?? "MI";
    const rows = await ctx.db
      .query("marketReports")
      .withIndex("by_state_published", (q) => q.eq("state", targetState))
      .order("desc")
      .take(limit ?? 12);

    if (rows.length > 0) {
      return rows.map(reportToApiShape);
    }

    const reports = await ctx.db
      .query("reports")
      .withIndex("by_status_created", (q) => q.eq("status", "approved"))
      .collect();

    return [buildWeeklyMarketReport(reports.map(reportToApi), targetState)];
  },
});

export const publishWeekly = mutation({
  args: { state: v.optional(v.string()) },
  handler: async (ctx, { state }) => {
    await requireAdmin(ctx);
    const targetState = state ?? "MI";
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_status_created", (q) => q.eq("status", "approved"))
      .collect();

    const report = buildWeeklyMarketReport(
      reports.map(reportToApi),
      targetState
    );

    const id = await ctx.db.insert("marketReports", {
      weekStart: report.week_start,
      weekEnd: report.week_end,
      state: report.state,
      mostImprovedBrand: report.most_improved_brand,
      mostTrustedBrand: report.most_trusted_brand,
      hottestProduct: report.hottest_product,
      mostActiveCity: report.most_active_city,
      bestValueProduct: report.best_value_product,
      biggestBoofAlert: report.biggest_boof_alert,
      publishedAt: Date.now(),
    });

    return { id: id as string, report };
  },
});
