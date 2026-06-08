import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import {
  achievementId,
  applicationStatus,
  detectionType,
  detectorRank,
  leaderboardCategory,
  profileRole,
  signalEventType,
} from "./lib/intelligenceValidators";
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

  profiles: defineTable({
    userId: v.string(),
    role: profileRole,
    activeViewRole: v.optional(profileRole),
    detectorRank: detectorRank,
    detectionPoints: v.number(),
    referralCode: v.string(),
    customersReferred: v.number(),
    budtendersReferred: v.number(),
    activeReferrals: v.number(),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    verifiedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_referral_code", ["referralCode"])
    .index("by_role_points", ["role", "detectionPoints"]),

  detections: defineTable({
    userId: v.string(),
    type: detectionType,
    productName: v.string(),
    brandName: v.string(),
    brandSlug: v.string(),
    dispensaryName: v.optional(v.string()),
    city: v.string(),
    state: v.optional(v.string()),
    productType: v.string(),
    confidenceScore: v.number(),
    confirmations: v.number(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    issueTags: v.array(v.string()),
    pricePaid: v.optional(v.number()),
    boofScore: v.number(),
    reportId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
  })
    .index("by_type_created", ["type", "createdAt"])
    .index("by_status_created", ["status", "createdAt"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_brand_slug", ["brandSlug"]),

  brands: defineTable({
    name: v.string(),
    slug: v.string(),
    claimed: v.boolean(),
    claimedByUserId: v.optional(v.string()),
    trustScore: v.number(),
    reportCount: v.number(),
    avgBoofScore: v.number(),
    state: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_trust_score", ["trustScore"]),

  products: defineTable({
    name: v.string(),
    brandSlug: v.string(),
    brandName: v.string(),
    productType: v.string(),
    avgScore: v.number(),
    reportCount: v.number(),
    slug: v.string(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_brand_slug", ["brandSlug"])
    .index("by_type_score", ["productType", "avgScore"]),

  referrals: defineTable({
    referrerUserId: v.string(),
    referredUserId: v.string(),
    referralCode: v.string(),
    referredRole: profileRole,
    isActive: v.boolean(),
    pointsAwarded: v.number(),
    createdAt: v.number(),
  })
    .index("by_referrer", ["referrerUserId"])
    .index("by_referred", ["referredUserId"])
    .index("by_code", ["referralCode"]),

  notifications: defineTable({
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    read: v.boolean(),
    metadata: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_user_unread", ["userId", "read"]),

  leaderboardSnapshots: defineTable({
    category: leaderboardCategory,
    entries: v.array(
      v.object({
        rank: v.number(),
        name: v.string(),
        subtitle: v.optional(v.string()),
        score: v.number(),
        movement: v.number(),
        slug: v.optional(v.string()),
        reportCount: v.optional(v.number()),
      })
    ),
    state: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_category_updated", ["category", "updatedAt"]),

  marketReports: defineTable({
    weekStart: v.string(),
    weekEnd: v.string(),
    state: v.string(),
    mostImprovedBrand: v.string(),
    mostTrustedBrand: v.string(),
    hottestProduct: v.string(),
    mostActiveCity: v.string(),
    bestValueProduct: v.string(),
    biggestBoofAlert: v.string(),
    publishedAt: v.number(),
  }).index("by_state_published", ["state", "publishedAt"]),

  userAchievements: defineTable({
    userId: v.string(),
    achievementId: achievementId,
    earnedAt: v.number(),
  }).index("by_user", ["userId"]),

  budtenderApplications: defineTable({
    userId: v.string(),
    displayName: v.string(),
    dispensaryName: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    experience: v.optional(v.string()),
    status: applicationStatus,
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  brandApplications: defineTable({
    userId: v.string(),
    brandName: v.string(),
    companyEmail: v.string(),
    state: v.string(),
    website: v.optional(v.string()),
    status: applicationStatus,
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  productScores: defineTable({
    productSlug: v.string(),
    productName: v.string(),
    brandSlug: v.string(),
    brandName: v.string(),
    productType: v.string(),
    trustScore: v.number(),
    fireScore: v.number(),
    valueScore: v.number(),
    communityScore: v.optional(v.number()),
    flavorScore: v.optional(v.number()),
    burnScore: v.optional(v.number()),
    freshnessScore: v.optional(v.number()),
    reportCount: v.number(),
    updatedAt: v.number(),
  })
    .index("by_product_slug", ["productSlug"])
    .index("by_fire_score", ["fireScore"])
    .index("by_value_score", ["valueScore"])
    .index("by_community_score", ["communityScore"]),

  batchReports: defineTable({
    userId: v.string(),
    brandName: v.string(),
    productName: v.string(),
    batchId: v.optional(v.string()),
    packageDate: v.optional(v.string()),
    coaUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    createdAt: v.number(),
  })
    .index("by_brand_created", ["brandName", "createdAt"])
    .index("by_user", ["userId"]),

  signalEvents: defineTable({
    type: signalEventType,
    title: v.string(),
    detail: v.optional(v.string()),
    brandName: v.optional(v.string()),
    productName: v.optional(v.string()),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    movement: v.optional(v.number()),
    severity: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    expiresAt: v.optional(v.number()),
  })
    .index("by_active_created", ["isActive", "createdAt"])
    .index("by_type_active", ["type", "isActive"]),
});
