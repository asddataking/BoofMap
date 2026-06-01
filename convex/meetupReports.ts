import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { runModeration, looksLikeFullName } from "./lib/moderation";
import {
  buildPublicWarning,
  computeSellerSignal,
} from "./lib/sellerSignal";
import { requireIdentity } from "./lib/auth";
import { coordsForCity } from "./lib/cityCoords";
import { meetupToApi } from "./lib/mappers";

export const listApproved = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const rows = await ctx.db
      .query("meetupReports")
      .withIndex("by_status_created", (q) => q.eq("status", "approved"))
      .order("desc")
      .take(limit ?? 200);

    return rows.map(meetupToApi);
  },
});

/** Approved reports plus the signed-in reporter's pending/flagged submissions. */
export const listFeed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const cap = limit ?? 200;
    const approved = await ctx.db
      .query("meetupReports")
      .withIndex("by_status_created", (q) => q.eq("status", "approved"))
      .order("desc")
      .take(cap);

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return approved.map(meetupToApi);
    }

    const mine = await ctx.db
      .query("meetupReports")
      .withIndex("by_user_created", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(50);

    const approvedIds = new Set(approved.map((r) => r._id));
    const extra = mine.filter(
      (r) =>
        !approvedIds.has(r._id) &&
        (r.status === "pending" || r.status === "flagged")
    );

    const merged = [...extra, ...approved]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, cap);

    return merged.map(meetupToApi);
  },
});

export const listMine = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const rows = await ctx.db
      .query("meetupReports")
      .withIndex("by_user_created", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(limit ?? 50);

    return rows.map(meetupToApi);
  },
});

export const create = mutation({
  args: {
    sellerDisplayName: v.string(),
    platform: v.string(),
    city: v.string(),
    area: v.optional(v.string()),
    meetupType: v.string(),
    issueTags: v.array(v.string()),
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
      args.sellerDisplayName,
      args.area,
      args.platform
    );
    if (!mod.pass) {
      return { error: mod.reasons.join(". ") };
    }
    if (looksLikeFullName(args.sellerDisplayName)) {
      return {
        error: "Use a seller display name or username — not a full legal name.",
      };
    }

    const existing = await ctx.db
      .query("meetupReports")
      .withIndex("by_seller_city", (q) =>
        q.eq("sellerDisplayName", args.sellerDisplayName.trim()).eq("city", args.city)
      )
      .collect();

    const approvedExisting = existing.filter((r) => r.status === "approved");
    const signal = computeSellerSignal(
      [
        ...approvedExisting.map((r) => ({
          issueTags: r.issueTags,
          confirmCount: r.confirmCount,
        })),
        { issueTags: args.issueTags, confirmCount: 0 },
      ]
    );

    const coords = coordsForCity(args.city);
    const now = Date.now();
    const status = mod.pass ? "approved" : "flagged";

    const id = await ctx.db.insert("meetupReports", {
      userId,
      sellerDisplayName: args.sellerDisplayName.trim(),
      platform: args.platform,
      city: args.city,
      area: args.area?.trim() || undefined,
      meetupType: args.meetupType,
      issueTags: args.issueTags,
      sellerSignal: signal,
      notes: args.notes?.trim() || undefined,
      latitude:
        args.latitude ?? coords.lat + (Math.random() - 0.5) * 0.02,
      longitude:
        args.longitude ?? coords.lng + (Math.random() - 0.5) * 0.02,
      confirmCount: 0,
      imageUrl: args.imageUrl,
      imageKey: args.imageKey,
      status,
      moderationFlags: mod.reasons,
      publicWarning: undefined,
      createdAt: now,
    });

    if (status === "flagged") {
      await ctx.db.insert("moderationQueue", {
        sourceType: "meetupReport",
        sourceId: id,
        reasons: mod.reasons,
        status: "pending",
        previewText: (args.notes ?? args.sellerDisplayName).slice(0, 500),
        imageUrl: args.imageUrl,
        createdAt: now,
      });
    } else {
      await recalcSellerWarnings(ctx, args.sellerDisplayName.trim(), args.city);
    }

    const doc = await ctx.db.get(id);
    if (!doc) throw new Error("Meetup report not created");

    return { report: meetupToApi(doc) };
  },
});

async function recalcSellerWarnings(
  ctx: MutationCtx,
  sellerDisplayName: string,
  city: string
) {
  const reports = await ctx.db
    .query("meetupReports")
    .withIndex("by_seller_city", (q) =>
      q.eq("sellerDisplayName", sellerDisplayName).eq("city", city)
    )
    .collect();

  const warning = buildPublicWarning(
    reports.map((r) => ({ issueTags: r.issueTags, status: r.status })),
    sellerDisplayName,
    city
  );

  for (const r of reports) {
    if (r.status === "approved") {
      await ctx.db.patch(r._id, { publicWarning: warning ?? undefined });
    }
  }
}

export const confirm = mutation({
  args: {
    reportId: v.id("meetupReports"),
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
          .eq("voteType", "confirm")
      )
      .unique();

    if (existing) return { error: "Already confirmed" };

    await ctx.db.insert("votes", {
      reportId: args.reportId,
      userId,
      voteType: "confirm",
      source: "meetupReport",
      createdAt: Date.now(),
    });

    const report = await ctx.db.get(args.reportId);
    if (!report) return { error: "Not found" };

    await ctx.db.patch(args.reportId, {
      confirmCount: report.confirmCount + 1,
    });

    await recalcSellerWarnings(
      ctx,
      report.sellerDisplayName,
      report.city
    );

    const updated = await ctx.db.get(args.reportId);
    return updated ? { report: meetupToApi(updated) } : { error: "Not found" };
  },
});
