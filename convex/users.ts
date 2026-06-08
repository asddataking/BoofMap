import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import { internalMutation, mutation, query } from "./_generated/server";
import { isAdminIdentity, requireIdentity } from "./lib/auth";
import { userProfileToApi } from "./lib/mappers";
import {
  levelFromPoints,
  POINTS_PER_REPORT,
  roleTitleForLevel,
} from "./lib/userProfile";

export const syncCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const clerkId = identity.subject;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    const displayName =
      identity.name ??
      identity.nickname ??
      identity.email?.split("@")[0] ??
      undefined;
    const role = isAdminIdentity(identity) ? "admin" : "user";

    if (existing) {
      if (displayName && displayName !== existing.displayName) {
        await ctx.db.patch(existing._id, { displayName });
      }
      if (existing.role !== role) {
        await ctx.db.patch(existing._id, { role });
      }
      await ensureIntelligenceProfile(ctx, clerkId, displayName);
      return existing._id;
    }

    const id = await ctx.db.insert("users", {
      clerkId,
      displayName,
      role,
      reputation: 0,
      reportCount: 0,
      createdAt: Date.now(),
    });
    await ensureIntelligenceProfile(ctx, clerkId, displayName);
    return id;
  },
});

async function ensureIntelligenceProfile(
  ctx: MutationCtx,
  userId: string,
  displayName?: string
) {
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .unique();

  if (profile) return;

  await ctx.db.insert("profiles", {
    userId,
    role: "customer",
    activeViewRole: "customer",
    detectorRank: "observer",
    detectionPoints: 0,
    referralCode: `BD-${userId.slice(-6).toUpperCase()}`,
    customersReferred: 0,
    budtendersReferred: 0,
    activeReferrals: 0,
    displayName,
    updatedAt: Date.now(),
  });
}

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const admin = isAdminIdentity(identity);
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return {
        uid: identity.subject,
        display_name:
          identity.name ??
          identity.nickname ??
          identity.email?.split("@")[0] ??
          undefined,
        role: admin ? ("admin" as const) : ("user" as const),
        reputation: 0,
        report_count: 0,
      };
    }

    return {
      uid: user.clerkId,
      display_name: user.displayName,
      role: admin ? ("admin" as const) : user.role,
      reputation: user.reputation,
      report_count: user.reportCount,
    };
  },
});

function tierTitle(reputation: number, reportCount: number): string {
  if (reportCount >= 50 || reputation >= 2000) return "Smoke GM";
  if (reportCount >= 20 || reputation >= 800) return "Field Analyst";
  if (reportCount >= 5 || reputation >= 200) return "Scout";
  return "Rookie Reporter";
}

function badgesFor(reputation: number, reportCount: number): string[] {
  const badges: string[] = [];
  if (reportCount >= 1) badges.push("Early Reporter");
  if (reportCount >= 10) badges.push("Boof Hunter");
  if (reputation >= 500) badges.push("Fire Scout");
  if (reportCount >= 25) badges.push("Trusted Voice");
  return badges.length ? badges : ["Community Member"];
}

function defaultProfileFields(userId: string, displayName?: string) {
  const now = Date.now();
  return {
    userId,
    displayName,
    roleTitle: roleTitleForLevel(1),
    level: 1,
    points: 0,
    reportCount: 0,
    streakCount: 0,
    accuracyScore: undefined as number | undefined,
    badges: [] as string[],
    updatedAt: now,
  };
}

export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const userId = identity.subject;
    const displayName =
      identity.name ??
      identity.nickname ??
      identity.email?.split("@")[0] ??
      undefined;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (profile) return userProfileToApi(profile);

    const clerkUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();

    const base = defaultProfileFields(
      userId,
      clerkUser?.displayName ?? displayName
    );
    if (clerkUser) {
      base.reportCount = clerkUser.reportCount;
      base.points = clerkUser.reputation;
      base.level = levelFromPoints(clerkUser.reputation);
      base.roleTitle = tierTitle(clerkUser.reputation, clerkUser.reportCount);
      base.badges = badgesFor(clerkUser.reputation, clerkUser.reportCount);
      base.accuracyScore = Math.min(
        99,
        70 + Math.floor(clerkUser.reputation / 50)
      );
      base.streakCount = Math.min(30, Math.floor(clerkUser.reportCount / 2) + 1);
    }

    return {
      user_id: base.userId,
      display_name: base.displayName ?? null,
      role_title: base.roleTitle,
      level: base.level,
      points: base.points,
      report_count: base.reportCount,
      streak_count: base.streakCount,
      accuracy_score: base.accuracyScore ?? null,
      badges: base.badges,
      updated_at: new Date(base.updatedAt).toISOString(),
    };
  },
});

export const upsertUserProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    badges: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const userId = identity.subject;
    const now = Date.now();

    const displayName =
      args.displayName?.trim() ||
      identity.name ||
      identity.nickname ||
      identity.email?.split("@")[0];

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      const patch: {
        displayName?: string;
        badges?: string[];
        updatedAt: number;
      } = { updatedAt: now };
      if (displayName) patch.displayName = displayName;
      if (args.badges) patch.badges = args.badges;
      await ctx.db.patch(existing._id, patch);
      const updated = await ctx.db.get(existing._id);
      return updated ? userProfileToApi(updated) : null;
    }

    const id = await ctx.db.insert("userProfiles", {
      ...defaultProfileFields(userId, displayName),
      badges: args.badges ?? [],
    });
    const created = await ctx.db.get(id);
    return created ? userProfileToApi(created) : null;
  },
});

export const incrementUserStatsAfterReport = internalMutation({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const now = Date.now();

    const clerkUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
      .unique();

    if (clerkUser) {
      await ctx.db.patch(clerkUser._id, {
        reportCount: clerkUser.reportCount + 1,
        reputation: clerkUser.reputation + POINTS_PER_REPORT,
      });
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    const nextPoints =
      (profile?.points ?? clerkUser?.reputation ?? 0) + POINTS_PER_REPORT;
    const nextReportCount =
      (profile?.reportCount ?? clerkUser?.reportCount ?? 0) + 1;
    const nextLevel = levelFromPoints(nextPoints);
    const nextStreak = (profile?.streakCount ?? 0) + 1;
    const nextBadges =
      profile?.badges.length
        ? profile.badges
        : badgesFor(nextPoints, nextReportCount);

    const profileDoc = {
      displayName: profile?.displayName ?? clerkUser?.displayName,
      roleTitle: tierTitle(nextPoints, nextReportCount),
      level: nextLevel,
      points: nextPoints,
      reportCount: nextReportCount,
      streakCount: nextStreak,
      accuracyScore:
        profile?.accuracyScore ??
        Math.min(99, 70 + Math.floor(nextPoints / 50)),
      badges: nextBadges,
      updatedAt: now,
    };

    if (profile) {
      await ctx.db.patch(profile._id, profileDoc);
    } else {
      await ctx.db.insert("userProfiles", {
        userId,
        ...profileDoc,
      });
    }
  },
});
