import { v } from "convex/values";
import { query } from "./_generated/server";
import { detectionType } from "./lib/intelligenceValidators";
import {
  detectionTypeFromReport,
  reportToDetection,
} from "./lib/intelligenceData";
import { reportToApi } from "./lib/mappers";

export const listByType = query({
  args: {
    type: v.optional(detectionType),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { type, limit }) => {
    const stored = await ctx.db
      .query("detections")
      .withIndex("by_status_created", (q) => q.eq("status", "approved"))
      .order("desc")
      .take(limit ?? 30);

    if (stored.length > 0) {
      const filtered = type
        ? stored.filter((d) => d.type === type)
        : stored;
      return filtered.map((d) => ({
        id: d._id as string,
        type: d.type,
        user_id: d.userId,
        product_name: d.productName,
        brand_name: d.brandName,
        dispensary_name: d.dispensaryName ?? null,
        city: d.city,
        state: d.state ?? null,
        confidence_score: d.confidenceScore,
        confirmations: d.confirmations,
        latitude: d.latitude ?? null,
        longitude: d.longitude ?? null,
        image_url: d.imageUrl ?? null,
        notes: d.notes ?? null,
        issue_tags: d.issueTags,
        created_at: new Date(d.createdAt).toISOString(),
      }));
    }

    const reports = await ctx.db
      .query("reports")
      .withIndex("by_status_created", (q) => q.eq("status", "approved"))
      .order("desc")
      .take(limit ?? 40);

    const apiReports = reports.map(reportToApi);
    const detections = apiReports.map(reportToDetection);

    if (type) {
      return detections.filter((d) => d.type === type);
    }
    return detections;
  },
});

export const listLatest = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_status_created", (q) => q.eq("status", "approved"))
      .order("desc")
      .take(limit ?? 20);

    return reports.map(reportToApi).map(reportToDetection);
  },
});

export const countByType = query({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_status_created", (q) => q.eq("status", "approved"))
      .collect();

    const counts = { fire: 0, boof: 0, value: 0, warning: 0 };
    for (const r of reports) {
      const api = reportToApi(r);
      const type = detectionTypeFromReport(api);
      counts[type] += 1;
    }
    return counts;
  },
});
