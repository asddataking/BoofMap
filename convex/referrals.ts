import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireIdentity } from "./lib/auth";
import { profileRole } from "./lib/intelligenceValidators";

const REFERRAL_POINTS = {
  customer: 15,
  budtender: 25,
} as const;

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    const referrals = await ctx.db
      .query("referrals")
      .withIndex("by_referrer", (q) => q.eq("referrerUserId", identity.subject))
      .collect();

    return {
      referral_code: profile?.referralCode ?? `BD-${identity.subject.slice(-6).toUpperCase()}`,
      customers_referred: referrals.filter((r) => r.referredRole === "customer")
        .length,
      budtenders_referred: referrals.filter(
        (r) => r.referredRole === "budtender"
      ).length,
      active_referrals: referrals.filter((r) => r.isActive).length,
      total_points: referrals.reduce((s, r) => s + r.pointsAwarded, 0),
    };
  },
});

export const redeem = mutation({
  args: {
    referralCode: v.string(),
    role: v.optional(profileRole),
  },
  handler: async (ctx, { referralCode, role }) => {
    const identity = await requireIdentity(ctx);
    const referredUserId = identity.subject;

    const existing = await ctx.db
      .query("referrals")
      .withIndex("by_referred", (q) => q.eq("referredUserId", referredUserId))
      .first();

    if (existing) return { error: "Already referred" };

    const referrer = await ctx.db
      .query("profiles")
      .withIndex("by_referral_code", (q) =>
        q.eq("referralCode", referralCode.trim().toUpperCase())
      )
      .unique();

    if (!referrer) return { error: "Invalid referral code" };
    if (referrer.userId === referredUserId) {
      return { error: "Cannot refer yourself" };
    }

    const referredRole = role ?? "customer";
    const points =
      referredRole === "budtender"
        ? REFERRAL_POINTS.budtender
        : REFERRAL_POINTS.customer;

    await ctx.db.insert("referrals", {
      referrerUserId: referrer.userId,
      referredUserId,
      referralCode: referralCode.trim().toUpperCase(),
      referredRole,
      isActive: true,
      pointsAwarded: points,
      createdAt: Date.now(),
    });

    const patch: Record<string, number> = {
      detectionPoints: referrer.detectionPoints + points,
      activeReferrals: referrer.activeReferrals + 1,
    };
    if (referredRole === "customer") {
      patch.customersReferred = referrer.customersReferred + 1;
    } else if (referredRole === "budtender") {
      patch.budtendersReferred = referrer.budtendersReferred + 1;
    }

    await ctx.db.patch(referrer._id, {
      ...patch,
      updatedAt: Date.now(),
    });

    return { ok: true, points };
  },
});
