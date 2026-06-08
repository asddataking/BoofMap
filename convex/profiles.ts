import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { requireAdmin, requireIdentity } from "./lib/auth";
import { profileRole } from "./lib/intelligenceValidators";

function generateReferralCode(userId: string): string {
  const hash = userId.slice(-6).toUpperCase();
  return `BD-${hash}`;
}

function rankFromPoints(points: number) {
  if (points >= 2000) return "chief_analyst" as const;
  if (points >= 750) return "analyst" as const;
  if (points >= 300) return "investigator" as const;
  if (points >= 100) return "detector" as const;
  return "observer" as const;
}

function rankProgress(points: number): number {
  const thresholds = [0, 100, 300, 750, 2000];
  let idx = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (points >= thresholds[i]) {
      idx = i;
      break;
    }
  }
  const next = thresholds[idx + 1];
  if (!next) return 100;
  return Math.min(
    100,
    Math.round(((points - thresholds[idx]) / (next - thresholds[idx])) * 100)
  );
}

async function unlockedRoles(
  ctx: QueryCtx,
  userId: string,
  profileRole: "customer" | "budtender" | "brand"
) {
  const roles = new Set<"customer" | "budtender" | "brand">(["customer"]);

  if (profileRole === "budtender" || profileRole === "brand") {
    roles.add(profileRole);
  }

  const budtenderApps = await ctx.db
    .query("budtenderApplications")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  if (budtenderApps.some((a) => a.status === "approved")) {
    roles.add("budtender");
  }

  const brandApps = await ctx.db
    .query("brandApplications")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  if (brandApps.some((a) => a.status === "approved")) {
    roles.add("brand");
  }

  return [...roles];
}

export const getRoleContext = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const userId = identity.subject;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    const displayName =
      profile?.displayName ??
      identity.name ??
      identity.nickname ??
      identity.email?.split("@")[0] ??
      null;

    const verifiedRole = profile?.role ?? "customer";
    const available = await unlockedRoles(ctx, userId, verifiedRole);
    const activeView = profile?.activeViewRole ?? verifiedRole;

    const budtenderApps = await ctx.db
      .query("budtenderApplications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const brandApps = await ctx.db
      .query("brandApplications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const latestBudtender = budtenderApps.sort(
      (a, b) => b.createdAt - a.createdAt
    )[0];
    const latestBrand = brandApps.sort((a, b) => b.createdAt - a.createdAt)[0];

    return {
      user_id: userId,
      display_name: displayName,
      verified_role: verifiedRole,
      active_view_role: available.includes(activeView) ? activeView : "customer",
      available_roles: available,
      budtender_application: latestBudtender
        ? {
            status: latestBudtender.status,
            display_name: latestBudtender.displayName,
            dispensary_name: latestBudtender.dispensaryName ?? null,
          }
        : null,
      brand_application: latestBrand
        ? {
            status: latestBrand.status,
            brand_name: latestBrand.brandName,
          }
        : null,
    };
  },
});

/** @deprecated Use getRoleContext — kept for hooks that read gamification fields */
export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const userId = identity.subject;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) {
      return {
        user_id: userId,
        role: "customer" as const,
        detector_rank: "observer" as const,
        detection_points: 0,
        rank_progress: 0,
        referral_code: generateReferralCode(userId),
        customers_referred: 0,
        budtenders_referred: 0,
        active_referrals: 0,
        display_name:
          identity.name ??
          identity.nickname ??
          identity.email?.split("@")[0] ??
          null,
      };
    }

    return {
      user_id: profile.userId,
      role: profile.role,
      detector_rank: profile.detectorRank,
      detection_points: profile.detectionPoints,
      rank_progress: rankProgress(profile.detectionPoints),
      referral_code: profile.referralCode,
      customers_referred: profile.customersReferred,
      budtenders_referred: profile.budtendersReferred,
      active_referrals: profile.activeReferrals,
      display_name: profile.displayName ?? null,
    };
  },
});

export const setActiveViewRole = mutation({
  args: { role: profileRole },
  handler: async (ctx, { role }) => {
    const identity = await requireIdentity(ctx);
    const userId = identity.subject;

    const profile = await ensureProfileExists(ctx, userId);
    const available = await unlockedRoles(ctx, userId, profile.role);

    if (!available.includes(role)) {
      return { error: "Role not unlocked" };
    }

    await ctx.db.patch(profile._id, {
      activeViewRole: role,
      updatedAt: Date.now(),
    });

    return { ok: true, active_view_role: role };
  },
});

export const upsert = mutation({
  args: {
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const userId = identity.subject;

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    const now = Date.now();

    if (existing) {
      const patch: Record<string, unknown> = { updatedAt: now };
      if (args.displayName) patch.displayName = args.displayName.trim();
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    const id = await ctx.db.insert("profiles", {
      userId,
      role: "customer",
      activeViewRole: "customer",
      detectorRank: "observer",
      detectionPoints: 0,
      referralCode: generateReferralCode(userId),
      customersReferred: 0,
      budtendersReferred: 0,
      activeReferrals: 0,
      displayName:
        args.displayName?.trim() ??
        identity.name ??
        identity.nickname ??
        identity.email?.split("@")[0],
      updatedAt: now,
    });
    return id;
  },
});

export const addDetectionPoints = mutation({
  args: {
    userId: v.string(),
    points: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, { userId, points }) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (!profile) return { error: "Profile not found" };

    const newPoints = profile.detectionPoints + points;
    await ctx.db.patch(profile._id, {
      detectionPoints: newPoints,
      detectorRank: rankFromPoints(newPoints),
      updatedAt: Date.now(),
    });

    await ctx.db.insert("notifications", {
      userId,
      type: "points_earned",
      title: "Report points earned",
      body: `+${points} report points`,
      read: false,
      createdAt: Date.now(),
    });

    return { ok: true, points: newPoints };
  },
});

export const submitBudtenderApplication = mutation({
  args: {
    displayName: v.string(),
    dispensaryName: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    experience: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const userId = identity.subject;

    const existing = await ctx.db
      .query("budtenderApplications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing && existing.status === "pending") {
      return { error: "Application already pending" };
    }

    await ctx.db.insert("budtenderApplications", {
      userId,
      displayName: args.displayName.trim(),
      dispensaryName: args.dispensaryName?.trim(),
      city: args.city.trim(),
      state: args.state.trim(),
      experience: args.experience?.trim(),
      status: "pending",
      createdAt: Date.now(),
    });

    return { ok: true };
  },
});

export const getBudtenderApplication = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const apps = await ctx.db
      .query("budtenderApplications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    const app = apps.sort((a, b) => b.createdAt - a.createdAt)[0];

    if (!app) return null;

    return {
      id: app._id as string,
      status: app.status,
      display_name: app.displayName,
      dispensary_name: app.dispensaryName ?? null,
      city: app.city,
      state: app.state,
      created_at: new Date(app.createdAt).toISOString(),
    };
  },
});

export const listPendingBudtenderApplications = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db
      .query("budtenderApplications")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    return rows.map((a) => ({
      id: a._id as string,
      user_id: a.userId,
      display_name: a.displayName,
      dispensary_name: a.dispensaryName ?? null,
      city: a.city,
      state: a.state,
      experience: a.experience ?? null,
      created_at: new Date(a.createdAt).toISOString(),
    }));
  },
});

export const reviewBudtenderApplication = mutation({
  args: {
    applicationId: v.id("budtenderApplications"),
    action: v.union(v.literal("approve"), v.literal("reject")),
  },
  handler: async (ctx, { applicationId, action }) => {
    await requireAdmin(ctx);
    const app = await ctx.db.get(applicationId);
    if (!app) return { error: "Application not found" };

    const status = action === "approve" ? "approved" : "rejected";
    await ctx.db.patch(applicationId, {
      status,
      reviewedAt: Date.now(),
    });

    if (action === "approve") {
      const profile = await ensureProfileExists(ctx, app.userId);
      await ctx.db.patch(profile._id, {
        role: "budtender",
        activeViewRole: "budtender",
        displayName: app.displayName,
        verifiedAt: Date.now(),
        updatedAt: Date.now(),
      });

      await ctx.db.insert("notifications", {
        userId: app.userId,
        type: "budtender_approved",
        title: "Welcome to Boof Insiders",
        body: "Your insider application was approved. You are now a verified insider.",
        read: false,
        createdAt: Date.now(),
      });
    }

    return { ok: true, status };
  },
});

async function ensureProfileExists(ctx: MutationCtx, userId: string) {
  const existing = await ctx.db
    .query("profiles")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .unique();

  if (existing) return existing;

  const id = await ctx.db.insert("profiles", {
    userId,
    role: "customer",
    activeViewRole: "customer",
    detectorRank: "observer",
    detectionPoints: 0,
    referralCode: generateReferralCode(userId),
    customersReferred: 0,
    budtendersReferred: 0,
    activeReferrals: 0,
    updatedAt: Date.now(),
  });

  const doc = await ctx.db.get(id);
  if (!doc) throw new Error("Profile not created");
  return doc;
}

export const getBrandApplication = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const apps = await ctx.db
      .query("brandApplications")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
    const app = apps.sort((a, b) => b.createdAt - a.createdAt)[0];
    if (!app) return null;

    return {
      id: app._id as string,
      status: app.status,
      brand_name: app.brandName,
      company_email: app.companyEmail,
      state: app.state,
      created_at: new Date(app.createdAt).toISOString(),
    };
  },
});

export const submitBrandApplication = mutation({
  args: {
    brandName: v.string(),
    companyEmail: v.string(),
    state: v.string(),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const userId = identity.subject;

    const pending = await ctx.db
      .query("brandApplications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (pending.some((a) => a.status === "pending")) {
      return { error: "Application already pending" };
    }

    await ctx.db.insert("brandApplications", {
      userId,
      brandName: args.brandName.trim(),
      companyEmail: args.companyEmail.trim(),
      state: args.state.trim(),
      website: args.website?.trim(),
      status: "pending",
      createdAt: Date.now(),
    });

    return { ok: true };
  },
});

export const listPendingBrandApplications = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db
      .query("brandApplications")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    return rows.map((a) => ({
      id: a._id as string,
      user_id: a.userId,
      brand_name: a.brandName,
      company_email: a.companyEmail,
      state: a.state,
      website: a.website ?? null,
      created_at: new Date(a.createdAt).toISOString(),
    }));
  },
});

export const reviewBrandApplication = mutation({
  args: {
    applicationId: v.id("brandApplications"),
    action: v.union(v.literal("approve"), v.literal("reject")),
  },
  handler: async (ctx, { applicationId, action }) => {
    await requireAdmin(ctx);
    const app = await ctx.db.get(applicationId);
    if (!app) return { error: "Application not found" };

    const status = action === "approve" ? "approved" : "rejected";
    await ctx.db.patch(applicationId, {
      status,
      reviewedAt: Date.now(),
    });

    if (action === "approve") {
      const profile = await ensureProfileExists(ctx, app.userId);
      await ctx.db.patch(profile._id, {
        role: "brand",
        activeViewRole: "brand",
        displayName: app.brandName,
        verifiedAt: Date.now(),
        updatedAt: Date.now(),
      });

      await ctx.db.insert("notifications", {
        userId: app.userId,
        type: "brand_approved",
        title: "Brand partnership approved",
        body: `${app.brandName} is now on the intelligence network.`,
        read: false,
        createdAt: Date.now(),
      });
    }

    return { ok: true, status };
  },
});
