import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { rankingTrend, rankingType, tickerType } from "./lib/validators";

const reportStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("flagged")
);

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    anonymousId: v.optional(v.string()),
    displayName: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin")),
    reputation: v.number(),
    reportCount: v.number(),
    createdAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_anonymous_id", ["anonymousId"]),

  reports: defineTable({
    userId: v.string(),
    productType: v.string(),
    brandName: v.string(),
    dispensaryName: v.string(),
    city: v.string(),
    strainName: v.string(),
    pricePaid: v.optional(v.number()),
    packageDate: v.optional(v.string()),
    issueTags: v.array(v.string()),
    boofScore: v.number(),
    notes: v.optional(v.string()),
    latitude: v.number(),
    longitude: v.number(),
    confirmCount: v.number(),
    downvoteCount: v.number(),
    imageUrl: v.optional(v.string()),
    imageKey: v.optional(v.string()),
    status: reportStatus,
    moderationFlags: v.array(v.string()),
    trustScore: v.optional(v.number()),
    reportType: v.optional(v.string()),
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_status_created", ["status", "createdAt"])
    .index("by_status", ["status"])
    .index("by_user_created", ["userId", "createdAt"]),

  meetupReports: defineTable({
    userId: v.string(),
    sellerDisplayName: v.string(),
    platform: v.string(),
    city: v.string(),
    area: v.optional(v.string()),
    meetupType: v.string(),
    issueTags: v.array(v.string()),
    sellerSignal: v.string(),
    notes: v.optional(v.string()),
    latitude: v.number(),
    longitude: v.number(),
    confirmCount: v.number(),
    imageUrl: v.optional(v.string()),
    imageKey: v.optional(v.string()),
    status: reportStatus,
    moderationFlags: v.array(v.string()),
    publicWarning: v.optional(v.string()),
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_status_created", ["status", "createdAt"])
    .index("by_status", ["status"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_seller_city", ["sellerDisplayName", "city"]),

  votes: defineTable({
    reportId: v.string(),
    userId: v.string(),
    voteType: v.union(v.literal("confirm"), v.literal("downvote")),
    source: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_report_user_type", ["reportId", "userId", "voteType"]),

  moderationQueue: defineTable({
    sourceType: v.union(v.literal("report"), v.literal("meetupReport")),
    sourceId: v.string(),
    reasons: v.array(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    previewText: v.string(),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
  }).index("by_status_created", ["status", "createdAt"]),

  tickerItems: defineTable({
    title: v.string(),
    type: tickerType,
    state: v.optional(v.string()),
    city: v.optional(v.string()),
    productName: v.optional(v.string()),
    brandName: v.optional(v.string()),
    severity: v.optional(v.string()),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_active_created", ["isActive", "createdAt"])
    .index("by_type_active", ["type", "isActive"]),

  rankings: defineTable({
    productId: v.optional(v.string()),
    productName: v.string(),
    brandName: v.optional(v.string()),
    category: v.string(),
    state: v.optional(v.string()),
    score: v.number(),
    previousScore: v.optional(v.number()),
    movement: v.number(),
    reportCount: v.number(),
    rankingType: rankingType,
    trend: rankingTrend,
    updatedAt: v.number(),
  })
    .index("by_ranking_type_updated", ["rankingType", "updatedAt"])
    .index("by_ranking_type_score", ["rankingType", "score"]),

  userProfiles: defineTable({
    userId: v.string(),
    displayName: v.optional(v.string()),
    roleTitle: v.string(),
    level: v.number(),
    points: v.number(),
    reportCount: v.number(),
    streakCount: v.number(),
    accuracyScore: v.optional(v.number()),
    badges: v.array(v.string()),
    updatedAt: v.number(),
  }).index("by_user_id", ["userId"]),

  notificationPreferences: defineTable({
    userId: v.string(),
    enabled: v.boolean(),
    state: v.optional(v.string()),
    categories: v.array(v.string()),
    followedBrands: v.array(v.string()),
    followedProducts: v.array(v.string()),
    updatedAt: v.number(),
  }).index("by_user_id", ["userId"]),
});
