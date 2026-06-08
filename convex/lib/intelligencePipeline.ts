import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { GAMIFICATION_ENABLED } from "./featureFlags";
import { detectionTypeFromReport } from "./intelligenceData";
import { computeScores, type ProductAgg } from "./scoreEngine";
import { slugify } from "./slugify";

const SIGNAL_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DETECTION_POINTS = {
  verified_detection: 10,
  batch_information: 20,
  confirmed_alert: 8,
} as const;

type ReportDoc = Doc<"reports">;

function rankFromPoints(points: number) {
  if (points >= 2000) return "chief_analyst" as const;
  if (points >= 750) return "analyst" as const;
  if (points >= 300) return "investigator" as const;
  if (points >= 100) return "detector" as const;
  return "observer" as const;
}

function generateReferralCode(userId: string) {
  return `BD-${userId.slice(-6).toUpperCase()}`;
}

export async function ensureProfile(ctx: MutationCtx, userId: string) {
  const existing = await ctx.db
    .query("profiles")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .unique();

  if (existing) return existing;

  const clerkUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", userId))
    .unique();

  const id = await ctx.db.insert("profiles", {
    userId,
    role: "customer",
    detectorRank: "observer",
    detectionPoints: 0,
    referralCode: generateReferralCode(userId),
    customersReferred: 0,
    budtendersReferred: 0,
    activeReferrals: 0,
    displayName: clerkUser?.displayName,
    updatedAt: Date.now(),
  });

  const doc = await ctx.db.get(id);
  if (!doc) throw new Error("Profile not created");
  return doc;
}

export async function addDetectionPoints(
  ctx: MutationCtx,
  userId: string,
  points: number,
  notification: { title: string; body: string; type: string }
) {
  if (!GAMIFICATION_ENABLED) return 0;

  const profile = await ensureProfile(ctx, userId);
  const prevRank = profile.detectorRank;
  const newPoints = profile.detectionPoints + points;
  const newRank = rankFromPoints(newPoints);

  await ctx.db.patch(profile._id, {
    detectionPoints: newPoints,
    detectorRank: newRank,
    updatedAt: Date.now(),
  });

  await ctx.db.insert("notifications", {
    userId,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    read: false,
    createdAt: Date.now(),
  });

  if (newRank !== prevRank) {
    await ctx.db.insert("notifications", {
      userId,
      type: "rank_up",
      title: "You ranked up!",
      body: `Promoted to ${newRank.replace(/_/g, " ")}`,
      read: false,
      createdAt: Date.now(),
    });

    if (newRank === "analyst" || newRank === "chief_analyst") {
      await awardAchievement(ctx, userId, "market_analyst");
    }
  }

  return newPoints;
}

async function awardAchievement(
  ctx: MutationCtx,
  userId: string,
  achievementId:
    | "first_detection"
    | "boof_buster"
    | "fire_finder"
    | "value_hunter"
    | "market_analyst"
    | "top_detector"
) {
  if (!GAMIFICATION_ENABLED) return;

  const existing = await ctx.db
    .query("userAchievements")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();

  if (existing.some((a) => a.achievementId === achievementId)) return;

  await ctx.db.insert("userAchievements", {
    userId,
    achievementId,
    earnedAt: Date.now(),
  });

  const labels: Record<string, string> = {
    first_detection: "First Report",
    boof_buster: "Boof Buster",
    fire_finder: "Fire Finder",
    value_hunter: "Value Hunter",
    market_analyst: "Market Analyst",
    top_detector: "Top Reporter",
  };

  await ctx.db.insert("notifications", {
    userId,
    type: "achievement",
    title: `Achievement: ${labels[achievementId] ?? achievementId}`,
    body: "Badge unlocked",
    read: false,
    createdAt: Date.now(),
  });
}

async function checkAchievements(
  ctx: MutationCtx,
  userId: string,
  detectionType: string
) {
  if (!GAMIFICATION_ENABLED) return;

  const detections = await ctx.db
    .query("detections")
    .withIndex("by_user_created", (q) => q.eq("userId", userId))
    .collect();

  const approved = detections.filter((d) => d.status === "approved");

  if (approved.length === 1) {
    await awardAchievement(ctx, userId, "first_detection");
  }
  if (approved.filter((d) => d.type === "boof").length >= 10) {
    await awardAchievement(ctx, userId, "boof_buster");
  }
  if (approved.filter((d) => d.type === "fire").length >= 10) {
    await awardAchievement(ctx, userId, "fire_finder");
  }
  if (approved.filter((d) => d.type === "value").length >= 5) {
    await awardAchievement(ctx, userId, "value_hunter");
  }

  void detectionType;
}

export async function upsertBrandAndProduct(ctx: MutationCtx, report: ReportDoc) {
  const brandSlug = slugify(report.brandName);
  const productSlug = slugify(`${report.strainName}-${report.brandName}`);

  const brand = await ctx.db
    .query("brands")
    .withIndex("by_slug", (q) => q.eq("slug", brandSlug))
    .unique();

  if (brand) {
    const brandReports = await ctx.db
      .query("detections")
      .withIndex("by_brand_slug", (q) => q.eq("brandSlug", brandSlug))
      .collect();
    const scores = brandReports.map((d) => d.boofScore);
    scores.push(report.boofScore);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    await ctx.db.patch(brand._id, {
      reportCount: brand.reportCount + 1,
      avgBoofScore: Math.round(avg * 10) / 10,
      trustScore: Math.min(100, Math.round(avg * 20)),
      updatedAt: Date.now(),
    });
  } else {
    await ctx.db.insert("brands", {
      name: report.brandName,
      slug: brandSlug,
      claimed: false,
      trustScore: Math.round(report.boofScore * 20),
      reportCount: 1,
      avgBoofScore: report.boofScore,
      state: "MI",
      updatedAt: Date.now(),
    });
  }

  const product = await ctx.db
    .query("products")
    .withIndex("by_slug", (q) => q.eq("slug", productSlug))
    .unique();

  if (product) {
    const nextCount = product.reportCount + 1;
    const nextAvg =
      (product.avgScore * product.reportCount + report.boofScore) / nextCount;
    await ctx.db.patch(product._id, {
      reportCount: nextCount,
      avgScore: Math.round(nextAvg * 10) / 10,
      updatedAt: Date.now(),
    });
  } else {
    await ctx.db.insert("products", {
      name: report.strainName,
      brandSlug,
      brandName: report.brandName,
      productType: report.productType,
      avgScore: report.boofScore,
      reportCount: 1,
      slug: productSlug,
      updatedAt: Date.now(),
    });
  }

  const scoreDoc = await ctx.db
    .query("productScores")
    .withIndex("by_product_slug", (q) => q.eq("productSlug", productSlug))
    .unique();

  const fireScore = report.boofScore >= 4 ? report.boofScore : 0;
  const valueScore =
    report.pricePaid != null && report.pricePaid < 35 ? report.boofScore : 0;

  const agg: ProductAgg = {
    productSlug,
    productName: report.strainName,
    brandName: report.brandName,
    brandSlug,
    productType: report.productType,
    scores: scoreDoc
      ? Array(scoreDoc.reportCount).fill(scoreDoc.trustScore / 20)
      : [],
    prices: [],
    confirms: report.confirmCount,
    issueTags: report.issueTags,
    packageDates: report.packageDate ? [report.packageDate] : [],
    reportTimestamps: [report.createdAt],
  };
  agg.scores.push(report.boofScore);
  if (report.pricePaid != null) agg.prices.push(report.pricePaid);

  const intelScores = computeScores(agg);

  if (scoreDoc) {
    await ctx.db.patch(scoreDoc._id, {
      fireScore: Math.max(scoreDoc.fireScore, fireScore),
      valueScore: Math.max(scoreDoc.valueScore, valueScore),
      communityScore: intelScores.communityScore,
      flavorScore: intelScores.flavorScore,
      burnScore: intelScores.burnScore,
      freshnessScore: intelScores.freshnessScore,
      reportCount: scoreDoc.reportCount + 1,
      trustScore: intelScores.communityScore,
      updatedAt: Date.now(),
    });
  } else {
    await ctx.db.insert("productScores", {
      productSlug,
      productName: report.strainName,
      brandSlug,
      brandName: report.brandName,
      productType: report.productType,
      trustScore: intelScores.communityScore,
      fireScore,
      valueScore: intelScores.valueScore,
      communityScore: intelScores.communityScore,
      flavorScore: intelScores.flavorScore,
      burnScore: intelScores.burnScore,
      freshnessScore: intelScores.freshnessScore,
      reportCount: 1,
      updatedAt: Date.now(),
    });
  }
}

export async function createSignalFromReport(
  ctx: MutationCtx,
  report: ReportDoc,
  detectionType: string
) {
  const now = Date.now();
  const movement = Math.floor(Math.random() * 10) + 3;

  let type: "fire_trending" | "boof_alert" | "value_detected" | "batch_warning" =
    "fire_trending";
  let title = `${report.strainName} trending +${movement}`;

  if (detectionType === "boof") {
    type = "boof_alert";
    title = `Boof alert: ${report.strainName}`;
  } else if (detectionType === "value") {
    type = "value_detected";
    title = "New best value detected";
  } else if (detectionType === "warning") {
    type = "batch_warning";
    title = "Batch warning verified";
  }

  await ctx.db.insert("signalEvents", {
    type,
    title,
    detail: `${report.brandName} · ${report.city}`,
    brandName: report.brandName,
    productName: report.strainName,
    city: report.city,
    state: "MI",
    movement: detectionType === "fire" ? movement : undefined,
    severity:
      detectionType === "warning" || detectionType === "boof"
        ? "high"
        : undefined,
    isActive: true,
    createdAt: now,
    expiresAt: now + SIGNAL_TTL_MS,
  });
}

export async function createDetectionFromReport(
  ctx: MutationCtx,
  report: ReportDoc
): Promise<Id<"detections">> {
  const apiShape = {
    id: report._id as string,
    brand_name: report.brandName,
    strain_name: report.strainName,
    city: report.city,
    boof_score: report.boofScore,
    price_paid: report.pricePaid ?? null,
    issue_tags: report.issueTags,
    confirm_count: report.confirmCount,
    product_type: report.productType,
    created_at: new Date(report.createdAt).toISOString(),
  };

  const type = detectionTypeFromReport(apiShape);
  const brandSlug = slugify(report.brandName);

  const existing = await ctx.db
    .query("detections")
    .withIndex("by_user_created", (q) => q.eq("userId", report.userId))
    .filter((q) => q.eq(q.field("reportId"), report._id as string))
    .first();

  if (existing) return existing._id;

  return await ctx.db.insert("detections", {
    userId: report.userId,
    type,
    productName: report.strainName,
    brandName: report.brandName,
    brandSlug,
    dispensaryName: report.dispensaryName,
    city: report.city,
    state: "MI",
    productType: report.productType,
    confidenceScore: Math.min(
      99,
      Math.round(report.boofScore * 18 + report.confirmCount * 3)
    ),
    confirmations: report.confirmCount,
    latitude: report.latitude,
    longitude: report.longitude,
    imageUrl: report.imageUrl,
    notes: report.notes,
    issueTags: report.issueTags,
    pricePaid: report.pricePaid,
    boofScore: report.boofScore,
    reportId: report._id as string,
    status: "approved",
    createdAt: report.createdAt,
  });
}

export async function processApprovedReport(
  ctx: MutationCtx,
  report: ReportDoc,
  options?: { isNew?: boolean }
) {
  const apiShape = {
    id: report._id as string,
    brand_name: report.brandName,
    strain_name: report.strainName,
    city: report.city,
    boof_score: report.boofScore,
    price_paid: report.pricePaid ?? null,
    issue_tags: report.issueTags,
    confirm_count: report.confirmCount,
    product_type: report.productType,
    created_at: new Date(report.createdAt).toISOString(),
  };
  const detectionType = detectionTypeFromReport(apiShape);

  await createDetectionFromReport(ctx, report);
  await upsertBrandAndProduct(ctx, report);
  await createSignalFromReport(ctx, report, detectionType);

  if (GAMIFICATION_ENABLED && options?.isNew !== false) {
    await addDetectionPoints(ctx, report.userId, DETECTION_POINTS.verified_detection, {
      type: "points_earned",
      title: "Report verified",
      body: `+${DETECTION_POINTS.verified_detection} report points`,
    });
    await checkAchievements(ctx, report.userId, detectionType);
  }
}

export async function processConfirmation(
  ctx: MutationCtx,
  report: ReportDoc,
  confirmerUserId: string
) {
  const detection = await ctx.db
    .query("detections")
    .withIndex("by_user_created", (q) => q.eq("userId", report.userId))
    .filter((q) => q.eq(q.field("reportId"), report._id as string))
    .first();

  if (detection) {
    await ctx.db.patch(detection._id, {
      confirmations: report.confirmCount,
      confidenceScore: Math.min(
        99,
        Math.round(report.boofScore * 18 + report.confirmCount * 3)
      ),
    });
  }

  if (GAMIFICATION_ENABLED && confirmerUserId !== report.userId) {
    await addDetectionPoints(
      ctx,
      confirmerUserId,
      DETECTION_POINTS.confirmed_alert,
      {
        type: "points_earned",
        title: "Alert confirmed",
        body: `+${DETECTION_POINTS.confirmed_alert} report points`,
      }
    );
  }

  await ctx.db.insert("notifications", {
    userId: report.userId,
    type: "detection_confirmed",
    title: "Your report was confirmed",
    body: `${report.strainName} · ${report.brandName} — community verified`,
    read: false,
    createdAt: Date.now(),
  });
}
