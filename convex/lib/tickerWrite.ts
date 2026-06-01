import type { MutationCtx } from "../_generated/server";

const TICKER_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function insertTickerFromReport(
  ctx: MutationCtx,
  args: {
    brandName: string;
    city: string;
    productName: string;
    severity: string;
    issueTags: string[];
  }
) {
  const hasMold = args.issueTags.includes("Mold");
  const type = hasMold ? ("warning" as const) : ("alert" as const);
  const title = hasMold
    ? `Mold alert: ${args.brandName} in ${args.city}`
    : `Boof alert: ${args.brandName} — ${args.productName} (${args.city})`;

  const now = Date.now();
  await ctx.db.insert("tickerItems", {
    title,
    type,
    city: args.city,
    state: "MI",
    productName: args.productName,
    brandName: args.brandName,
    severity: args.severity,
    createdAt: now,
    expiresAt: now + TICKER_TTL_MS,
    isActive: true,
  });
}
