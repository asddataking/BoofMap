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
  v.literal("fraud"),
  v.literal("top_flower_week"),
  v.literal("biggest_movers"),
  v.literal("hot_drops"),
  v.literal("value_picks"),
  v.literal("rising_brands"),
  v.literal("falling_brands")
);

export const rankingTrend = v.union(
  v.literal("hot"),
  v.literal("rising"),
  v.literal("falling"),
  v.literal("steady"),
  v.literal("volatile"),
  v.literal("boof_watch")
);
