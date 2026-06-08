import type { Doc } from "../_generated/dataModel";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function computeBullishPercent(yesCount: number, noCount: number) {
  const total = yesCount + noCount;
  if (total === 0) return 50;
  return Math.round((yesCount / total) * 100);
}

export function analystTierFromStats(
  total: number,
  accuracy: number
): Doc<"forecastProfiles">["analystTier"] {
  if (total >= 200 && accuracy >= 90) return "community_oracle";
  if (total >= 100 && accuracy >= 80) return "top_analyst";
  if (total >= 50 && accuracy >= 70) return "senior_analyst";
  if (total >= 25 && accuracy >= 60) return "market_scout";
  if (total >= 10 && accuracy >= 50) return "trend_watcher";
  return "rookie_analyst";
}

export function analystTierLabel(
  tier: Doc<"forecastProfiles">["analystTier"]
): string {
  const labels: Record<Doc<"forecastProfiles">["analystTier"], string> = {
    rookie_analyst: "Rookie Analyst",
    trend_watcher: "Trend Watcher",
    market_scout: "Market Scout",
    senior_analyst: "Senior Analyst",
    top_analyst: "Top Analyst",
    community_oracle: "Community Oracle",
  };
  return labels[tier];
}

export function confidencePoints(
  confidence: Doc<"marketVotes">["confidence"]
): number {
  if (confidence === "high") return 3;
  if (confidence === "medium") return 2;
  return 1;
}

export function marketToApi(
  market: Doc<"markets">,
  userVote?: Doc<"marketVotes"> | null
) {
  const now = Date.now();
  const msLeft = Math.max(0, market.closesAt - now);
  const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));

  return {
    id: market._id as string,
    question: market.question,
    target_type: market.targetType,
    product_slug: market.productSlug ?? null,
    product_name: market.productName ?? null,
    brand_slug: market.brandSlug ?? null,
    brand_name: market.brandName ?? null,
    status: market.status,
    closes_at: new Date(market.closesAt).toISOString(),
    days_left: daysLeft,
    yes_count: market.yesCount,
    no_count: market.noCount,
    total_forecasts: market.totalForecasts,
    bullish_percent: market.bullishPercent,
    bearish_percent: 100 - market.bullishPercent,
    outcome: market.outcome ?? null,
    user_vote: userVote
      ? {
          vote: userVote.vote,
          confidence: userVote.confidence,
        }
      : null,
    created_at: new Date(market.createdAt).toISOString(),
  };
}

export function forecastProfileToApi(profile: Doc<"forecastProfiles">, rank = 0) {
  return {
    user_id: profile.userId,
    total_forecasts: profile.totalForecasts,
    correct_forecasts: profile.correctForecasts,
    incorrect_forecasts: profile.incorrectForecasts,
    accuracy_percent: profile.accuracyPercent,
    forecast_points: profile.forecastPoints,
    analyst_tier: profile.analystTier,
    analyst_tier_label: analystTierLabel(profile.analystTier),
    forecast_rank: rank,
  };
}

export function defaultClosesAt() {
  return Date.now() + WEEK_MS;
}
