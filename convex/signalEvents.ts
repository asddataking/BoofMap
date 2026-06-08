import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import {
  buildSignalEventsFromReports,
  computeIntelligenceStats,
  computeMarketStatus,
} from "./lib/intelligenceData";
import { reportToApi } from "./lib/mappers";
import { signalEventType } from "./lib/intelligenceValidators";

function signalToApi(s: {
  _id: string;
  type: string;
  title: string;
  detail?: string;
  brandName?: string;
  productName?: string;
  city?: string;
  state?: string;
  movement?: number;
  severity?: string;
  createdAt: number;
}) {
  return {
    id: s._id as string,
    type: s.type,
    title: s.title,
    detail: s.detail ?? null,
    brand_name: s.brandName ?? null,
    product_name: s.productName ?? null,
    city: s.city ?? null,
    state: s.state ?? null,
    movement: s.movement ?? null,
    severity: s.severity ?? null,
    created_at: new Date(s.createdAt).toISOString(),
  };
}

function computedSignalsFromReports(
  reports: ReturnType<typeof reportToApi>[],
  limit: number
) {
  return buildSignalEventsFromReports(reports).slice(0, limit).map((e, i) => ({
    id: `computed-${i}`,
    type: e.type,
    title: e.title,
    detail: e.detail ?? null,
    brand_name: e.brandName ?? null,
    product_name: e.productName ?? null,
    city: e.city ?? null,
    state: "MI",
    movement: e.movement ?? null,
    severity: null,
    created_at: new Date().toISOString(),
  }));
}

export const listActive = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const cap = limit ?? 20;
    const now = Date.now();

    try {
      const stored = await ctx.db
        .query("signalEvents")
        .withIndex("by_active_created", (q) => q.eq("isActive", true))
        .order("desc")
        .take(cap);

      const active = stored.filter(
        (s) => s.expiresAt == null || s.expiresAt > now
      );

      if (active.length > 0) {
        return active.map(signalToApi);
      }
    } catch {
      // Table may be missing on older deployments — fall through to reports.
    }

    const reports = await ctx.db
      .query("reports")
      .withIndex("by_status_created", (q) => q.eq("status", "approved"))
      .order("desc")
      .take(40);

    return computedSignalsFromReports(reports.map(reportToApi), cap);
  },
});

export const getIntelligenceStats = query({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_status_created", (q) => q.eq("status", "approved"))
      .collect();

    return computeIntelligenceStats(reports.map(reportToApi));
  },
});

export const getMarketStatus = query({
  args: { state: v.optional(v.string()) },
  handler: async (ctx, { state }) => {
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_status_created", (q) => q.eq("status", "approved"))
      .collect();

    return computeMarketStatus(reports.map(reportToApi), state ?? "MI");
  },
});

export const create = mutation({
  args: {
    type: signalEventType,
    title: v.string(),
    detail: v.optional(v.string()),
    brandName: v.optional(v.string()),
    productName: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    movement: v.optional(v.number()),
    severity: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const id = await ctx.db.insert("signalEvents", {
      type: args.type,
      title: args.title.trim(),
      detail: args.detail?.trim(),
      brandName: args.brandName?.trim(),
      productName: args.productName?.trim(),
      city: args.city?.trim(),
      state: args.state?.trim(),
      movement: args.movement,
      severity: args.severity,
      isActive: true,
      createdAt: Date.now(),
      expiresAt: args.expiresAt,
    });
    const doc = await ctx.db.get(id);
    return doc ? signalToApi(doc) : null;
  },
});
