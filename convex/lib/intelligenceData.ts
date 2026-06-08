import { slugify } from "./slugify";

type ReportRow = {
  id: string;
  brand_name: string;
  strain_name: string;
  city: string;
  boof_score: number;
  price_paid?: number | null;
  issue_tags: string[];
  confirm_count?: number;
  product_type: string;
  created_at: string;
};

export function detectionTypeFromReport(r: ReportRow) {
  const tags = r.issue_tags ?? [];
  if (tags.some((t) => /mold|fake|crc/i.test(t))) return "warning" as const;
  if (r.boof_score >= 4.5) return "fire" as const;
  if (r.boof_score <= 2) return "boof" as const;
  if (
    r.price_paid != null &&
    r.price_paid > 0 &&
    r.boof_score >= 3.5 &&
    r.price_paid < 30
  ) {
    return "value" as const;
  }
  if (r.boof_score <= 2.5) return "boof" as const;
  return "fire" as const;
}

export function reportToDetection(r: ReportRow) {
  const type = detectionTypeFromReport(r);
  const confirms = r.confirm_count ?? 0;
  return {
    id: r.id,
    type,
    user_id: "",
    product_name: r.strain_name,
    brand_name: r.brand_name,
    city: r.city,
    state: "MI",
    confidence_score: Math.min(
      99,
      Math.round(r.boof_score * 18 + confirms * 3)
    ),
    confirmations: confirms,
    issue_tags: r.issue_tags,
    created_at: r.created_at,
  };
}

export function buildSignalEventsFromReports(reports: ReportRow[]) {
  const events: {
    type: string;
    title: string;
    detail?: string;
    brandName?: string;
    productName?: string;
    city?: string;
    movement?: number;
  }[] = [];

  const brandCounts = new Map<string, number>();
  for (const r of reports) {
    const type = detectionTypeFromReport(r);
    if (type === "fire") {
      brandCounts.set(r.brand_name, (brandCounts.get(r.brand_name) ?? 0) + 1);
    }
  }

  for (const r of reports.slice(0, 8)) {
    const type = detectionTypeFromReport(r);
    if (type === "fire") {
      const movement = brandCounts.get(r.brand_name) ?? 1;
      events.push({
        type: "fire_trending",
        title: `${r.strain_name} trending +${movement}`,
        detail: r.brand_name,
        brandName: r.brand_name,
        productName: r.strain_name,
        city: r.city,
        movement,
      });
    } else if (type === "boof") {
      events.push({
        type: "boof_alert",
        title: `Boof alert: ${r.strain_name}`,
        detail: r.brand_name,
        brandName: r.brand_name,
        productName: r.strain_name,
        city: r.city,
      });
    } else if (type === "value") {
      events.push({
        type: "value_detected",
        title: `New best value detected`,
        detail: `${r.strain_name} · ${r.brand_name}`,
        brandName: r.brand_name,
        productName: r.strain_name,
        city: r.city,
      });
    } else if (type === "warning") {
      events.push({
        type: "batch_warning",
        title: `Batch warning verified`,
        detail: `${r.strain_name} · ${r.city}`,
        brandName: r.brand_name,
        productName: r.strain_name,
        city: r.city,
      });
    }
  }

  if (events.length < 4) {
    events.push(
      {
        type: "ranking_move",
        title: "North Coast enters Top 10",
        detail: "Fire brands",
        brandName: "North Coast",
        movement: 3,
      },
      {
        type: "fake_cart",
        title: "Fake cart alert reported",
        detail: "Community verified",
        city: "Detroit",
      }
    );
  }

  return events.slice(0, 12);
}

export function computeIntelligenceStats(reports: ReportRow[]) {
  const dayMs = 24 * 60 * 60 * 1000;
  const since = Date.now() - dayMs;

  let fireFound = 0;
  let boofExposed = 0;
  let fireToday = 0;
  let boofToday = 0;
  let verifiedSignals = 0;
  let communitySavings = 0;

  for (const r of reports) {
    const type = detectionTypeFromReport(r);
    const isToday = new Date(r.created_at).getTime() >= since;
    verifiedSignals += r.confirm_count ?? 0;

    if (type === "fire") {
      fireFound += 1;
      if (isToday) fireToday += 1;
    }
    if (type === "boof" || type === "warning") {
      boofExposed += 1;
      if (isToday) boofToday += 1;
    }
    if (type === "value" && r.price_paid != null) {
      communitySavings += Math.max(0, 45 - r.price_paid);
    }
  }

  return {
    fire_found: fireFound,
    boof_exposed: boofExposed,
    community_savings: Math.round(communitySavings),
    verified_signals: verifiedSignals,
    fire_today: fireToday,
    boof_today: boofToday,
  };
}

export function computeMarketStatus(reports: ReportRow[], state = "MI") {
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const thisWeek = reports.filter(
    (r) => now - new Date(r.created_at).getTime() < weekMs
  );
  const lastWeek = reports.filter((r) => {
    const age = now - new Date(r.created_at).getTime();
    return age >= weekMs && age < weekMs * 2;
  });

  const fireThis = thisWeek.filter(
    (r) => detectionTypeFromReport(r) === "fire"
  ).length;
  const fireLast = lastWeek.filter(
    (r) => detectionTypeFromReport(r) === "fire"
  ).length;
  const boofThis = thisWeek.filter((r) => {
    const t = detectionTypeFromReport(r);
    return t === "boof" || t === "warning";
  }).length;
  const warnings = thisWeek.filter(
    (r) => detectionTypeFromReport(r) === "warning"
  ).length;

  const fireTrend =
    fireLast > 0
      ? Math.round(((fireThis - fireLast) / fireLast) * 100)
      : fireThis > 0
        ? 100
        : 0;
  const boofTrend =
    fireLast > 0
      ? Math.round(((boofThis - fireLast) / Math.max(fireLast, 1)) * 100)
      : boofThis;

  return {
    state,
    fire_reports_rising: fireTrend > 0,
    new_boof_alerts: boofThis,
    batch_warnings: warnings,
    fire_trend_pct: fireTrend,
    boof_trend_pct: boofTrend,
    updated_at: new Date().toISOString(),
  };
}

type LeaderboardEntry = {
  rank: number;
  name: string;
  subtitle?: string;
  score: number;
  movement: number;
  slug?: string;
  reportCount?: number;
};

export function buildLeaderboardFromReports(
  reports: ReportRow[],
  category: string
): LeaderboardEntry[] {
  const map = new Map<
    string,
    { name: string; scores: number[]; brand?: string; type?: string }
  >();

  for (const r of reports) {
    const type = detectionTypeFromReport(r);
    const key =
      category === "top_fire_brands"
        ? r.brand_name
        : `${r.strain_name}::${r.brand_name}`;

    if (category === "top_fire_products" && type !== "fire") continue;
    if (category === "top_value_products" && type !== "value") continue;
    if (category === "top_fire_brands" && type !== "fire") continue;
    if (category === "top_flower" && r.product_type !== "flower") continue;
    if (category === "top_pre_rolls" && r.product_type !== "pre-roll") continue;
    if (
      category === "top_concentrates" &&
      r.product_type !== "concentrate"
    )
      continue;
    if (category === "top_rosin" && r.product_type !== "concentrate") continue;

    const entry = map.get(key) ?? {
      name:
        category === "top_fire_brands" ? r.brand_name : r.strain_name,
      scores: [],
      brand: r.brand_name,
      type: r.product_type,
    };
    entry.scores.push(r.boof_score);
    map.set(key, entry);
  }

  const sorted = [...map.values()]
    .map((e) => ({
      name: e.name,
      subtitle:
        category === "top_fire_brands"
          ? `${e.scores.length} reports`
          : `${e.brand ?? ""} · ${e.type ?? ""}`,
      score:
        Math.round(
          (e.scores.reduce((a, b) => a + b, 0) / e.scores.length) * 10
        ) / 10,
      movement: Math.floor(Math.random() * 8) - 2,
      slug: slugify(e.name),
      reportCount: e.scores.length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return sorted.map((e, i) => ({ ...e, rank: i + 1 }));
}

export function buildWeeklyMarketReport(reports: ReportRow[], state = "MI") {
  const brands = new Map<string, number[]>();
  const cities = new Map<string, number>();
  let hottest: ReportRow | null = null;
  let bestValue: ReportRow | null = null;
  let biggestBoof: ReportRow | null = null;

  for (const r of reports) {
    const scores = brands.get(r.brand_name) ?? [];
    scores.push(r.boof_score);
    brands.set(r.brand_name, scores);
    cities.set(r.city, (cities.get(r.city) ?? 0) + 1);

    const type = detectionTypeFromReport(r);
    if (type === "fire" && (!hottest || r.boof_score > hottest.boof_score)) {
      hottest = r;
    }
    if (
      type === "value" &&
      (!bestValue || (r.price_paid ?? 99) < (bestValue.price_paid ?? 99))
    ) {
      bestValue = r;
    }
    if (
      (type === "boof" || type === "warning") &&
      (!biggestBoof || r.boof_score < biggestBoof.boof_score)
    ) {
      biggestBoof = r;
    }
  }

  const brandAvgs = [...brands.entries()].map(([name, scores]) => ({
    name,
    avg: scores.reduce((a, b) => a + b, 0) / scores.length,
    count: scores.length,
  }));

  const mostTrusted = brandAvgs
    .filter((b) => b.count >= 2)
    .sort((a, b) => b.avg - a.avg)[0];
  const mostImproved = brandAvgs.sort((a, b) => b.count - a.count)[0];
  const mostActiveCity = [...cities.entries()].sort((a, b) => b[1] - a[1])[0];

  const now = new Date();
  const weekEnd = now.toISOString().slice(0, 10);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return {
    week_start: weekStart,
    week_end: weekEnd,
    state,
    most_improved_brand: mostImproved?.name ?? "—",
    most_trusted_brand: mostTrusted?.name ?? "—",
    hottest_product: hottest
      ? `${hottest.strain_name} · ${hottest.brand_name}`
      : "—",
    most_active_city: mostActiveCity?.[0] ?? "Detroit",
    best_value_product: bestValue
      ? `${bestValue.strain_name} · ${bestValue.brand_name}`
      : "—",
    biggest_boof_alert: biggestBoof
      ? `${biggestBoof.strain_name} · ${biggestBoof.brand_name}`
      : "—",
    published_at: now.toISOString(),
  };
}
