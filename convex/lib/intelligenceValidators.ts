import { v } from "convex/values";

export const profileRole = v.union(
  v.literal("customer"),
  v.literal("budtender"),
  v.literal("brand")
);

export const detectionType = v.union(
  v.literal("fire"),
  v.literal("boof"),
  v.literal("value"),
  v.literal("warning")
);

export const detectorRank = v.union(
  v.literal("observer"),
  v.literal("detector"),
  v.literal("investigator"),
  v.literal("analyst"),
  v.literal("chief_analyst")
);

export const signalEventType = v.union(
  v.literal("fire_trending"),
  v.literal("boof_alert"),
  v.literal("value_detected"),
  v.literal("batch_warning"),
  v.literal("ranking_move"),
  v.literal("brand_entry"),
  v.literal("fake_cart")
);

export const leaderboardCategory = v.union(
  v.literal("top_fire_products"),
  v.literal("top_fire_brands"),
  v.literal("top_value_products"),
  v.literal("top_flower"),
  v.literal("top_pre_rolls"),
  v.literal("top_rosin"),
  v.literal("top_concentrates")
);

export const achievementId = v.union(
  v.literal("first_detection"),
  v.literal("boof_buster"),
  v.literal("fire_finder"),
  v.literal("value_hunter"),
  v.literal("market_analyst"),
  v.literal("top_detector")
);

export const applicationStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected")
);

export const forecastTargetType = v.union(
  v.literal("product"),
  v.literal("brand")
);

export const forecastMarketStatus = v.union(
  v.literal("open"),
  v.literal("closed"),
  v.literal("resolved")
);

export const forecastVoteChoice = v.union(v.literal("yes"), v.literal("no"));

export const forecastConfidence = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high")
);

export const analystTier = v.union(
  v.literal("rookie_analyst"),
  v.literal("trend_watcher"),
  v.literal("market_scout"),
  v.literal("senior_analyst"),
  v.literal("top_analyst"),
  v.literal("community_oracle")
);
