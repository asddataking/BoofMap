import { v } from "convex/values";
import type { QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { requireIdentity } from "./lib/auth";
import { isHighSeverityReport, severityLabel } from "./lib/reportAlerts";
import { insertTickerFromReport } from "./lib/tickerWrite";
import { coordsForCity } from "./lib/cityCoords";
import { reportToApi } from "./lib/mappers";
import { runModeration, looksLikeFullName } from "./lib/moderation";
import { slugify } from "./lib/slugify";

const DEFAULT_LIMIT = 200;

async function loadApprovedReports(ctx: QueryCtx, limit = DEFAULT_LIMIT) {
  const rows = await ctx.db
    .query("reports")
    .withIndex("by_status_created", (q) => q.eq("status", "approved"))
    .order("desc")
    .take(limit);

  return rows.map(reportToApi);
}

export const listApproved = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => loadApprovedReports(ctx, limit ?? DEFAULT_LIMIT),
});

export const listMine = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const rows = await ctx.db
      .query("reports")
      .withIndex("by_user_created", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(limit ?? 50);

    return rows.map(reportToApi);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const list = await loadApprovedReports(ctx);
    const brands = new Set(list.map((r) => r.brand_name));
    const dispos = new Set(list.map((r) => r.dispensary_name));
    const taxed = list.filter((r) =>
      r.issue_tags.some((t) =>
        ["Overpriced / Taxed", "Fake Sale"].includes(t)
      )
    ).length;
    const boof = list.filter((r) => r.boof_score <= 2.5).length;

    return {
      boofReports: boof,
      disposRated: dispos.size,
      brandsReviewed: brands.size,
      taxedAlerts: taxed,
    };
  },
});

export const listBrandNames = query({
  args: {},
  handler: async (ctx) => {
    const list = await loadApprovedReports(ctx);
    return [...new Set(list.map((r) => r.brand_name))].sort();
  },
});

export const getBrandProfile = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const list = await loadApprovedReports(ctx);
    const brandReports = list.filter((r) => slugify(r.brand_name) === slug);
    if (!brandReports.length) return null;

    const name = brandReports[0].brand_name;
    const avg =
      brandReports.reduce((s, r) => s + r.boof_score, 0) / brandReports.length;
    const moldCount = brandReports.filter((r) =>
      r.issue_tags.includes("Mold")
    ).length;

    const complaintCounts: Record<string, number> = {};
    brandReports.forEach((r) => {
      r.issue_tags.forEach((t) => {
        complaintCounts[t] = (complaintCounts[t] ?? 0) + 1;
      });
    });
    const topComplaint = Object.entries(complaintCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    const product_breakdown: Record<string, number> = {};
    brandReports.forEach((r) => {
      product_breakdown[r.product_type] =
        (product_breakdown[r.product_type] ?? 0) + 1;
    });

    const trust = Math.round(
      Math.min(100, Math.max(0, avg * 18 + (5 - moldCount) * 4))
    );

    return {
      id: slug,
      name,
      slug,
      trust_score: trust,
      avg_boof_score: Math.round(avg * 10) / 10,
      report_count: brandReports.length,
      mold_report_count: moldCount,
      top_complaint: topComplaint,
      product_breakdown,
      recent_reports: brandReports.slice(0, 8),
    };
  },
});

export const getDispensaryProfile = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const list = await loadApprovedReports(ctx);
    const dispoReports = list.filter(
      (r) => slugify(r.dispensary_name) === slug
    );
    if (!dispoReports.length) return null;

    const name = dispoReports[0].dispensary_name;
    const city = dispoReports[0].city;
    const prices = dispoReports
      .map((r) => r.price_paid)
      .filter((p): p is number => p != null);
    const avgPrice =
      prices.length > 0
        ? prices.reduce((a, b) => a + b, 0) / prices.length
        : 0;
    const taxed = dispoReports.filter((r) =>
      r.issue_tags.some((t) =>
        ["Overpriced / Taxed", "Fake Sale"].includes(t)
      )
    ).length;
    const avgScore =
      dispoReports.reduce((s, r) => s + r.boof_score, 0) / dispoReports.length;
    const value = Math.round(
      Math.min(100, Math.max(0, avgScore * 20 - taxed * 5))
    );

    let sentiment: "positive" | "mixed" | "negative" = "mixed";
    if (avgScore >= 4) sentiment = "positive";
    else if (avgScore <= 2.5) sentiment = "negative";

    const fire_finds = dispoReports.filter((r) => r.boof_score >= 4.5);

    return {
      id: slug,
      name,
      slug,
      city,
      value_score: value,
      taxed_alert_count: taxed,
      avg_reported_price: Math.round(avgPrice),
      report_count: dispoReports.length,
      recent_reports: dispoReports.slice(0, 8),
      fire_finds: fire_finds.slice(0, 5),
      sentiment,
    };
  },
});

export const create = mutation({
  args: {
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
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    imageKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const userId = identity.subject;

    const mod = runModeration(
      args.notes,
      args.brandName,
      args.strainName,
      args.dispensaryName
    );
    if (!mod.pass) {
      return { error: mod.reasons.join(". ") };
    }
    if (
      looksLikeFullName(args.brandName) ||
      looksLikeFullName(args.dispensaryName)
    ) {
      return {
        error: "Use brand/dispensary names only — not personal legal names.",
      };
    }

    const coords = coordsForCity(args.city);
    const now = Date.now();
    const status = mod.pass ? "approved" : "flagged";

    const id = await ctx.db.insert("reports", {
      userId,
      productType: args.productType,
      brandName: args.brandName.trim(),
      dispensaryName: args.dispensaryName.trim(),
      city: args.city.trim(),
      strainName: args.strainName.trim(),
      pricePaid: args.pricePaid,
      packageDate: args.packageDate,
      issueTags: args.issueTags,
      boofScore: args.boofScore,
      notes: args.notes?.trim() || undefined,
      latitude: args.latitude ?? coords.lat,
      longitude: args.longitude ?? coords.lng,
      confirmCount: 0,
      downvoteCount: 0,
      imageUrl: args.imageUrl,
      imageKey: args.imageKey,
      status,
      moderationFlags: mod.reasons,
      trustScore:
        status === "approved" ? Math.round(args.boofScore * 20) : undefined,
      createdAt: now,
    });

    if (status === "flagged") {
      await ctx.db.insert("moderationQueue", {
        sourceType: "report",
        sourceId: id,
        reasons: mod.reasons,
        status: "pending",
        previewText: (args.notes ?? args.brandName).slice(0, 500),
        imageUrl: args.imageUrl,
        createdAt: now,
      });
    }

    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Report not created");

    if (status === "approved") {
      await ctx.runMutation(internal.users.incrementUserStatsAfterReport, {
        userId,
      });
      if (isHighSeverityReport(args.issueTags, args.boofScore)) {
        await insertTickerFromReport(ctx, {
          brandName: args.brandName.trim(),
          city: args.city.trim(),
          productName: args.strainName.trim() || args.productType,
          severity: severityLabel(args.issueTags, args.boofScore),
          issueTags: args.issueTags,
        });
      }
    }

    return {
      report: reportToApi(doc),
      queued: status !== "approved",
    };
  },
});

export const vote = mutation({
  args: {
    reportId: v.id("reports"),
    voteType: v.union(v.literal("confirm"), v.literal("downvote")),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const userId = identity.subject;

    const existing = await ctx.db
      .query("votes")
      .withIndex("by_report_user_type", (q) =>
        q
          .eq("reportId", args.reportId)
          .eq("userId", userId)
          .eq("voteType", args.voteType)
      )
      .unique();

    if (existing) return { error: "Already voted" };

    await ctx.db.insert("votes", {
      reportId: args.reportId,
      userId,
      voteType: args.voteType,
      createdAt: Date.now(),
    });

    const report = await ctx.db.get(args.reportId);
    if (!report) return { error: "Report not found" };

    await ctx.db.patch(args.reportId, {
      confirmCount:
        args.voteType === "confirm"
          ? report.confirmCount + 1
          : report.confirmCount,
      downvoteCount:
        args.voteType === "downvote"
          ? report.downvoteCount + 1
          : report.downvoteCount,
    });

    const updated = await ctx.db.get(args.reportId);
    return updated ? { report: reportToApi(updated) } : { error: "Not found" };
  },
});
