import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { buildTickerItems } from "./lib/homeData";
import { meetupToApi, reportToApi, tickerToApi } from "./lib/mappers";
import { insertTickerFromReport } from "./lib/tickerWrite";
import { tickerType } from "./lib/validators";

function dbTickerToHomeItem(t: {
  _id: string;
  title: string;
  type: string;
  city?: string;
  brandName?: string;
  productName?: string;
  createdAt: number;
}) {
  const label =
    t.type === "fire"
      ? "FIRE FIND"
      : t.type === "warning" || t.type === "alert"
        ? "BOOF ALERT"
        : t.type === "fresh_drop"
          ? "FRESH DROP"
          : t.type === "ranking"
            ? "RANKING"
            : "LIVE";
  const detail =
    t.productName && t.brandName
      ? `${t.productName} · ${t.brandName}${t.city ? ` · ${t.city}` : ""}`
      : t.title;

  return {
    id: `db-${t._id}`,
    label,
    detail,
    type:
      t.type === "warning" || t.type === "alert"
        ? ("alert" as const)
        : ("report" as const),
    timestamp: new Date(t.createdAt).toISOString(),
  };
}

export const listActiveTickerItems = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const now = Date.now();
    const stored = await ctx.db
      .query("tickerItems")
      .withIndex("by_active_created", (q) => q.eq("isActive", true))
      .order("desc")
      .take(limit ?? 50);

    const active = stored.filter(
      (t) => t.expiresAt == null || t.expiresAt > now
    );

    if (active.length > 0) {
      return active.map(dbTickerToHomeItem);
    }

    const reports = await ctx.db
      .query("reports")
      .withIndex("by_status_created", (q) => q.eq("status", "approved"))
      .order("desc")
      .take(12);

    const meetups = await ctx.db
      .query("meetupReports")
      .withIndex("by_status_created", (q) => q.eq("status", "approved"))
      .order("desc")
      .take(6);

    return buildTickerItems(
      reports.map(reportToApi),
      meetups.map(meetupToApi)
    );
  },
});

/** Full ticker row payload (admin / live API). */
export const listStoredTickerItems = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const now = Date.now();
    const rows = await ctx.db
      .query("tickerItems")
      .withIndex("by_active_created", (q) => q.eq("isActive", true))
      .order("desc")
      .take(limit ?? 50);

    return rows
      .filter((t) => t.expiresAt == null || t.expiresAt > now)
      .map(tickerToApi);
  },
});

export const createTickerItem = mutation({
  args: {
    title: v.string(),
    type: tickerType,
    state: v.optional(v.string()),
    city: v.optional(v.string()),
    productName: v.optional(v.string()),
    brandName: v.optional(v.string()),
    severity: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();
    const id = await ctx.db.insert("tickerItems", {
      title: args.title.trim(),
      type: args.type,
      state: args.state?.trim(),
      city: args.city?.trim(),
      productName: args.productName?.trim(),
      brandName: args.brandName?.trim(),
      severity: args.severity,
      createdAt: now,
      expiresAt: args.expiresAt,
      isActive: true,
    });
    const doc = await ctx.db.get(id);
    return doc ? tickerToApi(doc) : null;
  },
});

export const deactivateTickerItem = mutation({
  args: { tickerId: v.id("tickerItems") },
  handler: async (ctx, { tickerId }) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(tickerId);
    if (!item) return { error: "Ticker item not found" };
    await ctx.db.patch(tickerId, { isActive: false });
    return { ok: true };
  },
});

export const internalCreateFromReport = internalMutation({
  args: {
    brandName: v.string(),
    city: v.string(),
    productName: v.string(),
    severity: v.string(),
    issueTags: v.array(v.string()),
  },
  handler: async (ctx, args) => insertTickerFromReport(ctx, args),
});
