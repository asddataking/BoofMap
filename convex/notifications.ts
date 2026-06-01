import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireIdentity } from "./lib/auth";

const DEFAULT_CATEGORIES = [
  "mold_concern",
  "fire_drops_near_me",
  "fraud_watch",
];

export const getPreferences = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const row = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!row) {
      return {
        enabled: false,
        state: "MI",
        categories: DEFAULT_CATEGORIES,
        followed_brands: [] as string[],
        followed_products: [] as string[],
        updated_at: null as number | null,
      };
    }

    return {
      enabled: row.enabled,
      state: row.state ?? "MI",
      categories: row.categories,
      followed_brands: row.followedBrands,
      followed_products: row.followedProducts,
      updated_at: row.updatedAt,
    };
  },
});

export const updatePreferences = mutation({
  args: {
    enabled: v.boolean(),
    state: v.optional(v.string()),
    categories: v.array(v.string()),
    followedBrands: v.optional(v.array(v.string())),
    followedProducts: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const userId = identity.subject;
    const now = Date.now();

    const existing = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    const patch = {
      enabled: args.enabled,
      state: args.state,
      categories: args.categories,
      followedBrands: args.followedBrands ?? existing?.followedBrands ?? [],
      followedProducts: args.followedProducts ?? existing?.followedProducts ?? [],
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return { ok: true as const };
    }

    await ctx.db.insert("notificationPreferences", {
      userId,
      ...patch,
    });
    return { ok: true as const };
  },
});

/** Placeholder for future push delivery pipeline */
export const listPotentialAlerts = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const prefs = await ctx.db
      .query("notificationPreferences")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!prefs?.enabled) return [];

    // TODO: Match ticker items, rankings movement, and new reports to user categories.
    // TODO: Integrate FCM / Web Push VAPID delivery after preferences match.
    return [] as {
      id: string;
      title: string;
      category: string;
      created_at: number;
    }[];
  },
});
