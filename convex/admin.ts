import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { reportToApi, meetupToApi } from "./lib/mappers";
import {
  buildPublicWarning,
} from "./lib/sellerSignal";
import { requireAdmin } from "./lib/auth";
import type { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

const reportStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
  v.literal("flagged")
);

function userToApi(user: Doc<"users">) {
  return {
    id: user._id as string,
    clerk_id: user.clerkId,
    display_name: user.displayName ?? null,
    role: user.role,
    reputation: user.reputation,
    report_count: user.reportCount,
    created_at: new Date(user.createdAt).toISOString(),
  };
}

function reportToAdminApi(r: Doc<"reports">) {
  return {
    ...reportToApi(r),
    moderation_flags: r.moderationFlags,
    trust_score: r.trustScore ?? null,
    reviewed_at: r.reviewedAt ? new Date(r.reviewedAt).toISOString() : null,
  };
}

function meetupToAdminApi(r: Doc<"meetupReports">) {
  return {
    ...meetupToApi(r),
    moderation_flags: r.moderationFlags,
    reviewed_at: r.reviewedAt ? new Date(r.reviewedAt).toISOString() : null,
  };
}

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const users = await ctx.db.query("users").collect();
    const reports = await ctx.db.query("reports").collect();
    const meetups = await ctx.db.query("meetupReports").collect();
    const queue = await ctx.db
      .query("moderationQueue")
      .withIndex("by_status_created", (q) => q.eq("status", "pending"))
      .collect();

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    return {
      total_users: users.length,
      new_users_this_week: users.filter((u) => u.createdAt >= weekAgo).length,
      total_reports: reports.length,
      approved_reports: reports.filter((r) => r.status === "approved").length,
      pending_reports: reports.filter(
        (r) => r.status === "pending" || r.status === "flagged"
      ).length,
      rejected_reports: reports.filter((r) => r.status === "rejected").length,
      total_meetups: meetups.length,
      pending_meetups: meetups.filter(
        (r) => r.status === "pending" || r.status === "flagged"
      ).length,
      pending_queue: queue.length,
      recent_signups: users
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 8)
        .map(userToApi),
    };
  },
});

export const listUsers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    await requireAdmin(ctx);
    const users = await ctx.db.query("users").order("desc").take(limit ?? 100);
    return users.map(userToApi);
  },
});

export const listAllReports = query({
  args: {
    status: v.optional(reportStatus),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, limit }) => {
    await requireAdmin(ctx);

    if (status) {
      const rows = await ctx.db
        .query("reports")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .take(limit ?? 100);
      return rows.map(reportToAdminApi);
    }

    const rows = await ctx.db.query("reports").order("desc").take(limit ?? 100);
    return rows.map(reportToAdminApi);
  },
});

export const listAllMeetupReports = query({
  args: {
    status: v.optional(reportStatus),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, limit }) => {
    await requireAdmin(ctx);

    if (status) {
      const rows = await ctx.db
        .query("meetupReports")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .take(limit ?? 100);
      return rows.map(meetupToAdminApi);
    }

    const rows = await ctx.db
      .query("meetupReports")
      .order("desc")
      .take(limit ?? 100);
    return rows.map(meetupToAdminApi);
  },
});

export const listModerationQueue = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const items = await ctx.db
      .query("moderationQueue")
      .withIndex("by_status_created", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(100);

    return items.map((item) => ({
      id: item._id,
      source_type: item.sourceType,
      source_id: item.sourceId,
      reasons: item.reasons,
      status: item.status,
      preview_text: item.previewText,
      image_url: item.imageUrl ?? null,
      created_at: new Date(item.createdAt).toISOString(),
    }));
  },
});

export const listFlaggedReports = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const flagged = await ctx.db
      .query("reports")
      .withIndex("by_status", (q) => q.eq("status", "flagged"))
      .take(100);

    const pending = await ctx.db
      .query("reports")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .take(100);

    return [...flagged, ...pending].map(reportToAdminApi);
  },
});

export const listFlaggedMeetupReports = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const flagged = await ctx.db
      .query("meetupReports")
      .withIndex("by_status", (q) => q.eq("status", "flagged"))
      .take(100);

    const pending = await ctx.db
      .query("meetupReports")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .take(100);

    return [...flagged, ...pending].map(meetupToAdminApi);
  },
});

export const updateReport = mutation({
  args: {
    reportId: v.id("reports"),
    brandName: v.optional(v.string()),
    dispensaryName: v.optional(v.string()),
    strainName: v.optional(v.string()),
    city: v.optional(v.string()),
    productType: v.optional(v.string()),
    boofScore: v.optional(v.number()),
    notes: v.optional(v.string()),
    pricePaid: v.optional(v.number()),
    issueTags: v.optional(v.array(v.string())),
    status: v.optional(reportStatus),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error("Report not found");

    const patch: Partial<Doc<"reports">> = { reviewedAt: Date.now() };
    if (args.brandName !== undefined) patch.brandName = args.brandName;
    if (args.dispensaryName !== undefined) patch.dispensaryName = args.dispensaryName;
    if (args.strainName !== undefined) patch.strainName = args.strainName;
    if (args.city !== undefined) patch.city = args.city;
    if (args.productType !== undefined) patch.productType = args.productType;
    if (args.boofScore !== undefined) patch.boofScore = args.boofScore;
    if (args.notes !== undefined) patch.notes = args.notes;
    if (args.pricePaid !== undefined) patch.pricePaid = args.pricePaid;
    if (args.issueTags !== undefined) patch.issueTags = args.issueTags;
    if (args.status !== undefined) {
      patch.status = args.status;
      if (args.status === "approved") {
        patch.trustScore = Math.round(
          (args.boofScore ?? report.boofScore) * 20
        );
      }
    }

    await ctx.db.patch(args.reportId, patch);
    return args.reportId;
  },
});

export const updateMeetupReport = mutation({
  args: {
    reportId: v.id("meetupReports"),
    sellerDisplayName: v.optional(v.string()),
    platform: v.optional(v.string()),
    city: v.optional(v.string()),
    area: v.optional(v.string()),
    meetupType: v.optional(v.string()),
    notes: v.optional(v.string()),
    issueTags: v.optional(v.array(v.string())),
    sellerSignal: v.optional(v.string()),
    status: v.optional(reportStatus),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const report = await ctx.db.get(args.reportId);
    if (!report) throw new Error("Meetup report not found");

    const patch: Partial<Doc<"meetupReports">> = { reviewedAt: Date.now() };
    if (args.sellerDisplayName !== undefined)
      patch.sellerDisplayName = args.sellerDisplayName;
    if (args.platform !== undefined) patch.platform = args.platform;
    if (args.city !== undefined) patch.city = args.city;
    if (args.area !== undefined) patch.area = args.area;
    if (args.meetupType !== undefined) patch.meetupType = args.meetupType;
    if (args.notes !== undefined) patch.notes = args.notes;
    if (args.issueTags !== undefined) patch.issueTags = args.issueTags;
    if (args.sellerSignal !== undefined) patch.sellerSignal = args.sellerSignal;
    if (args.status !== undefined) patch.status = args.status;

    await ctx.db.patch(args.reportId, patch);

    if (args.status === "approved") {
      await recalcMeetupWarnings(
        ctx,
        args.sellerDisplayName ?? report.sellerDisplayName,
        args.city ?? report.city
      );
    }

    return args.reportId;
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.userId, { role: args.role });
    return args.userId;
  },
});

export const deleteReport = mutation({
  args: { reportId: v.id("reports") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.reportId);
  },
});

export const deleteMeetupReport = mutation({
  args: { reportId: v.id("meetupReports") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.reportId);
  },
});

export const moderate = mutation({
  args: {
    sourceType: v.union(v.literal("report"), v.literal("meetupReport")),
    sourceId: v.string(),
    queueId: v.optional(v.id("moderationQueue")),
    action: v.union(v.literal("approve"), v.literal("reject")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const now = Date.now();
    const status = args.action === "approve" ? "approved" : "rejected";

    if (args.sourceType === "report") {
      const id = args.sourceId as Id<"reports">;
      const report = await ctx.db.get(id);
      if (!report) throw new Error("Report not found");

      await ctx.db.patch(id, {
        status,
        reviewedAt: now,
        trustScore:
          status === "approved"
            ? Math.round(report.boofScore * 20)
            : report.trustScore,
      });
    } else {
      const id = args.sourceId as Id<"meetupReports">;
      const report = await ctx.db.get(id);
      if (!report) throw new Error("Meetup report not found");

      await ctx.db.patch(id, { status, reviewedAt: now });

      if (status === "approved") {
        await recalcMeetupWarnings(ctx, report.sellerDisplayName, report.city);
      }
    }

    if (args.queueId) {
      await ctx.db.patch(args.queueId, { status, reviewedAt: now });
    }
  },
});

export const searchReportsForAi = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { query: searchQuery, limit }) => {
    await requireAdmin(ctx);
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    const reports = await ctx.db.query("reports").take(300);
    return reports
      .filter(
        (r) =>
          r.strainName.toLowerCase().includes(q) ||
          r.brandName.toLowerCase().includes(q) ||
          r.dispensaryName.toLowerCase().includes(q) ||
          r.city.toLowerCase().includes(q) ||
          (r.notes?.toLowerCase().includes(q) ?? false)
      )
      .slice(0, limit ?? 8)
      .map(reportToAdminApi);
  },
});

async function recalcMeetupWarnings(
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
