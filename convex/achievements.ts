import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { achievementId } from "./lib/intelligenceValidators";

type AchievementKey =
  | "first_detection"
  | "boof_buster"
  | "fire_finder"
  | "value_hunter"
  | "market_analyst"
  | "top_detector";

const ACHIEVEMENT_META: Record<
  AchievementKey,
  { label: string; description: string }
> = {
  first_detection: {
    label: "First Report",
    description: "Submitted your first community report",
  },
  boof_buster: {
    label: "Boof Buster",
    description: "Exposed 10+ boof signals",
  },
  fire_finder: {
    label: "Fire Finder",
    description: "Identified 10+ fire products",
  },
  value_hunter: {
    label: "Value Hunter",
    description: "Surfaced 5+ value reports",
  },
  market_analyst: {
    label: "Market Analyst",
    description: "Reached Analyst rank",
  },
  top_detector: {
    label: "Top Reporter",
    description: "Top monthly contributor",
  },
};

export const listForUser = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, { userId }) => {
    const identity = await ctx.auth.getUserIdentity();
    const targetId = userId ?? identity?.subject;
    if (!targetId) return [];

    const earned = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", targetId))
      .collect();

    const earnedMap = new Map<AchievementKey, number>(
      earned.map((a) => [a.achievementId as AchievementKey, a.earnedAt])
    );

    return (Object.keys(ACHIEVEMENT_META) as AchievementKey[]).map((id) => {
      const meta = ACHIEVEMENT_META[id];
      return {
      id,
      label: meta.label,
      description: meta.description,
      earned_at: earnedMap.has(id)
        ? new Date(earnedMap.get(id)!).toISOString()
        : null,
      };
    });
  },
});

export const award = mutation({
  args: {
    userId: v.string(),
    achievementId: achievementId,
  },
  handler: async (ctx, { userId, achievementId: aid }) => {
    const existing = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (existing.some((a) => a.achievementId === aid)) {
      return { ok: true, already: true };
    }

    await ctx.db.insert("userAchievements", {
      userId,
      achievementId: aid,
      earnedAt: Date.now(),
    });

    const meta = ACHIEVEMENT_META[aid];
    await ctx.db.insert("notifications", {
      userId,
      type: "achievement",
      title: `Achievement unlocked: ${meta?.label ?? aid}`,
      body: meta?.description ?? "",
      read: false,
      createdAt: Date.now(),
    });

    return { ok: true };
  },
});
