import { v } from "convex/values";

export const tickerType = v.union(
  v.literal("alert"),
  v.literal("fire"),
  v.literal("ranking"),
  v.literal("warning"),
  v.literal("fresh_drop")
);

export const rankingType = v.union(
  v.literal("fire"),
  v.literal("fallers"),
  v.literal("reported"),
  v.literal("budget"),
  v.literal("fraud")
);

export const rankingTrend = v.union(
  v.literal("hot"),
  v.literal("rising"),
  v.literal("falling"),
  v.literal("steady"),
  v.literal("volatile"),
  v.literal("boof_watch")
);
