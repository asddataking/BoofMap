import { mutation } from "./_generated/server";
import { v } from "convex/values";

/** One-time seed for Michigan demo data. Call from Convex dashboard or a script. */
export const seedDemo = mutation({
  args: { adminUserId: v.optional(v.string()) },
  handler: async (ctx) => {
    const existing = await ctx.db.query("reports").take(1);
    if (existing.length > 0) {
      return { skipped: true, message: "Database already has reports" };
    }

    const now = Date.now();
    const demoReports = [
      {
        userId: "seed",
        productType: "flower",
        brandName: "Common Citizen",
        dispensaryName: "Green Genie",
        city: "Detroit",
        strainName: "Runtz",
        issueTags: ["Dry", "Weak High"],
        boofScore: 2,
        notes: "Dry and weak — not worth the ticket price.",
        latitude: 42.3314,
        longitude: -83.0458,
        confirmCount: 3,
        downvoteCount: 0,
        status: "approved" as const,
        moderationFlags: [],
        trustScore: 40,
        createdAt: now - 86400000,
      },
      {
        userId: "seed",
        productType: "cart",
        brandName: "Jeeter",
        dispensaryName: "House of Dank",
        city: "Detroit",
        strainName: "Honeydew",
        issueTags: ["Fire"],
        boofScore: 4.8,
        notes: "Legit flavor and strong high.",
        latitude: 42.35,
        longitude: -83.05,
        confirmCount: 8,
        downvoteCount: 0,
        status: "approved" as const,
        moderationFlags: [],
        trustScore: 96,
        createdAt: now - 43200000,
      },
    ];

    for (const r of demoReports) {
      await ctx.db.insert("reports", r);
    }

    const liveSeed = await seedLiveMvpData(ctx, now);

    return { inserted: demoReports.length, ...liveSeed };
  },
});

/** Demo ticker + rankings when those tables are empty (safe to call anytime). */
export const seedLiveMvp = mutation({
  args: {},
  handler: async (ctx) => seedLiveMvpData(ctx, Date.now()),
});

async function seedLiveMvpData(
  ctx: { db: import("./_generated/server").MutationCtx["db"] },
  now: number
) {
  const tickerExisting = await ctx.db.query("tickerItems").take(1);
  const rankingsExisting = await ctx.db.query("rankings").take(1);
  let tickerInserted = 0;
  let rankingsInserted = 0;

  if (tickerExisting.length === 0) {
    const demoTicker = [
      {
        title: "Fire find: Jeeter Honeydew cart trending in Detroit",
        type: "fire" as const,
        state: "MI",
        city: "Detroit",
        productName: "Honeydew",
        brandName: "Jeeter",
        severity: "positive",
        createdAt: now - 3600000,
        expiresAt: now + 7 * 86400000,
        isActive: true,
      },
      {
        title: "Boof watch: mold reports up for mid-shelf flower",
        type: "warning" as const,
        state: "MI",
        city: "Detroit",
        severity: "elevated",
        createdAt: now - 7200000,
        isActive: true,
      },
      {
        title: "Fresh drop radar: new live resin hitting Ann Arbor",
        type: "fresh_drop" as const,
        state: "MI",
        city: "Ann Arbor",
        createdAt: now - 1800000,
        expiresAt: now + 3 * 86400000,
        isActive: true,
      },
    ];
    for (const t of demoTicker) {
      await ctx.db.insert("tickerItems", t);
      tickerInserted++;
    }
  }

  if (rankingsExisting.length === 0) {
    const demoRankings = [
      {
        productName: "Honeydew Cart",
        brandName: "Jeeter",
        category: "cart",
        state: "MI",
        score: 4.8,
        previousScore: 4.5,
        movement: 1,
        reportCount: 8,
        rankingType: "fire" as const,
        trend: "hot" as const,
        updatedAt: now,
      },
      {
        productName: "Runtz",
        brandName: "Common Citizen",
        category: "flower",
        state: "MI",
        score: 2.0,
        previousScore: 2.8,
        movement: -1,
        reportCount: 5,
        rankingType: "fallers" as const,
        trend: "falling" as const,
        updatedAt: now,
      },
      {
        productName: "CRC Distillate Cart",
        brandName: "Unknown Brand",
        category: "cart",
        state: "MI",
        score: 1.2,
        movement: 0,
        reportCount: 12,
        rankingType: "fraud" as const,
        trend: "boof_watch" as const,
        updatedAt: now,
      },
    ];
    for (const r of demoRankings) {
      await ctx.db.insert("rankings", r);
      rankingsInserted++;
    }
  }

  return {
    ticker_inserted: tickerInserted,
    rankings_inserted: rankingsInserted,
    ticker_skipped: tickerExisting.length > 0,
    rankings_skipped: rankingsExisting.length > 0,
  };
}
