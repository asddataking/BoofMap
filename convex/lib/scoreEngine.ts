import { slugify } from "./slugify";

export type ReportRow = {
  id: string;
  brand_name: string;
  strain_name: string;
  city: string;
  boof_score: number;
  price_paid?: number | null;
  package_date?: string | null;
  issue_tags: string[];
  confirm_count?: number;
  product_type: string;
  created_at: string;
};

export type ProductAgg = {
  productSlug: string;
  productName: string;
  brandName: string;
  brandSlug: string;
  productType: string;
  scores: number[];
  prices: number[];
  confirms: number;
  issueTags: string[];
  packageDates: string[];
  reportTimestamps: number[];
};

export type IntelligenceScores = {
  communityScore: number;
  flavorScore: number;
  burnScore: number;
  valueScore: number;
  freshnessScore: number;
};

export type RankingEntry = {
  id: string;
  rank: number;
  productName: string;
  brandName: string;
  brandSlug: string;
  productSlug: string;
  score: number;
  previousScore?: number;
  movement: number;
  reportCount: number;
  pricePerGram?: number;
  productType: string;
};

const FLAVOR_PENALTY_TAGS = [
  "Hay / No Terps",
  "Harsh Smoke",
  "Chemical Taste",
  "No Flavor",
];

const BURN_PENALTY_TAGS = [
  "Black Ash",
  "Harsh Smoke",
  "Runs Hot",
  "Canoeing",
  "Harsh Hit",
];

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function productKey(strain: string, brand: string) {
  return slugify(`${strain}-${brand}`);
}

export function aggregateProducts(reports: ReportRow[]): ProductAgg[] {
  const map = new Map<string, ProductAgg>();

  for (const r of reports) {
    const key = productKey(r.strain_name, r.brand_name);
    const agg = map.get(key) ?? {
      productSlug: key,
      productName: r.strain_name,
      brandName: r.brand_name,
      brandSlug: slugify(r.brand_name),
      productType: r.product_type,
      scores: [],
      prices: [],
      confirms: 0,
      issueTags: [],
      packageDates: [],
      reportTimestamps: [],
    };
    agg.scores.push(r.boof_score);
    if (r.price_paid != null) agg.prices.push(r.price_paid);
    agg.confirms += r.confirm_count ?? 0;
    agg.issueTags.push(...r.issue_tags);
    if (r.package_date) agg.packageDates.push(r.package_date);
    agg.reportTimestamps.push(new Date(r.created_at).getTime());
    map.set(key, agg);
  }

  return [...map.values()];
}

export function computeScores(agg: ProductAgg): IntelligenceScores {
  const avgScore = avg(agg.scores);
  const avgPrice = avg(agg.prices);
  const avgConfirms = agg.confirms / Math.max(agg.scores.length, 1);

  const communityScore = clamp(
    Math.round(avgScore * 18 + avgConfirms * 3 + agg.scores.length * 2),
    0,
    100
  );

  const flavorPenalties = agg.issueTags.filter((t) =>
    FLAVOR_PENALTY_TAGS.includes(t)
  ).length;
  const flavorScore = clamp(
    Math.round(avgScore * 20 - flavorPenalties * 8),
    0,
    100
  );

  const burnPenalties = agg.issueTags.filter((t) =>
    BURN_PENALTY_TAGS.includes(t)
  ).length;
  const burnScore = clamp(
    Math.round(avgScore * 20 - burnPenalties * 10),
    0,
    100
  );

  let valueScore = 0;
  if (avgPrice > 0 && avgScore >= 3) {
    valueScore = clamp(Math.round((avgScore / avgPrice) * 45), 0, 100);
  }

  const now = Date.now();
  const recentReports = agg.reportTimestamps.filter(
    (t) => now - t < WEEK_MS
  ).length;
  const recencyBoost = recentReports * 5;
  const packageFreshness = agg.packageDates.length
    ? agg.packageDates.filter((d) => {
        const pkg = new Date(d).getTime();
        return !Number.isNaN(pkg) && now - pkg < 60 * 24 * 60 * 60 * 1000;
      }).length * 8
    : 0;
  const freshnessScore = clamp(
    Math.round(avgScore * 12 + recencyBoost + packageFreshness),
    0,
    100
  );

  return {
    communityScore,
    flavorScore,
    burnScore,
    valueScore,
    freshnessScore,
  };
}

function toRankingEntry(
  agg: ProductAgg,
  rank: number,
  score: number,
  movement: number,
  previousScore?: number
): RankingEntry {
  const avgPrice = avg(agg.prices);
  return {
    id: agg.productSlug,
    rank,
    productName: agg.productName,
    brandName: agg.brandName,
    brandSlug: agg.brandSlug,
    productSlug: agg.productSlug,
    score: Math.round(score * 10) / 10,
    previousScore,
    movement: Math.round(movement * 10) / 10,
    reportCount: agg.scores.length,
    pricePerGram: avgPrice > 0 ? Math.round(avgPrice * 100) / 100 : undefined,
    productType: agg.productType,
  };
}

function filterByWindow(reports: ReportRow[], windowMs: number) {
  const cutoff = Date.now() - windowMs;
  return reports.filter((r) => new Date(r.created_at).getTime() >= cutoff);
}

function filterPreviousWindow(reports: ReportRow[], windowMs: number) {
  const now = Date.now();
  const start = now - windowMs * 2;
  const end = now - windowMs;
  return reports.filter((r) => {
    const t = new Date(r.created_at).getTime();
    return t >= start && t < end;
  });
}

export function buildTopFlowerThisWeek(reports: ReportRow[]): RankingEntry[] {
  const thisWeek = filterByWindow(reports, WEEK_MS);
  const lastWeek = filterPreviousWindow(reports, WEEK_MS);

  const current = aggregateProducts(
    thisWeek.filter(
      (r) => r.product_type === "flower" || r.product_type === "pre-roll"
    )
  );
  const previous = aggregateProducts(
    lastWeek.filter(
      (r) => r.product_type === "flower" || r.product_type === "pre-roll"
    )
  );
  const prevMap = new Map(previous.map((p) => [p.productSlug, avg(p.scores)]));

  return current
    .filter((p) => avg(p.scores) >= 3.5)
    .sort((a, b) => avg(b.scores) - avg(a.scores) || b.confirms - a.confirms)
    .slice(0, 10)
    .map((p, i) => {
      const score = avg(p.scores);
      const prev = prevMap.get(p.productSlug) ?? score - 0.3;
      return toRankingEntry(p, i + 1, score, score - prev, prev);
    });
}

export function buildBiggestMovers(reports: ReportRow[]): RankingEntry[] {
  const thisWeek = filterByWindow(reports, WEEK_MS);
  const lastWeek = filterPreviousWindow(reports, WEEK_MS);

  const current = aggregateProducts(thisWeek);
  const previous = aggregateProducts(lastWeek);
  const prevMap = new Map(previous.map((p) => [p.productSlug, avg(p.scores)]));

  return current
    .map((p) => {
      const score = avg(p.scores);
      const prev = prevMap.get(p.productSlug) ?? score - 0.5;
      const movement = score - prev;
      return { p, score, movement, prev };
    })
    .filter((x) => x.movement > 0 && x.p.scores.length >= 1)
    .sort((a, b) => b.movement - a.movement || b.score - a.score)
    .slice(0, 8)
    .map((x, i) =>
      toRankingEntry(x.p, i + 1, x.score, x.movement, x.prev)
    );
}

export function buildHotDrops(reports: ReportRow[]): RankingEntry[] {
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  const recent = filterByWindow(reports, threeDays);
  const products = aggregateProducts(recent);

  return products
    .filter((p) => p.scores.length >= 1)
    .sort(
      (a, b) =>
        b.scores.length - a.scores.length ||
        avg(b.scores) - avg(a.scores) ||
        Math.max(...b.reportTimestamps) - Math.max(...a.reportTimestamps)
    )
    .slice(0, 8)
    .map((p, i) => {
      const score = avg(p.scores);
      return toRankingEntry(p, i + 1, score, p.scores.length * 0.3);
    });
}

export function buildValuePicks(reports: ReportRow[]): RankingEntry[] {
  const products = aggregateProducts(reports);

  return products
    .filter((p) => p.prices.length > 0 && avg(p.scores) >= 3.5)
    .map((p) => {
      const scores = computeScores(p);
      return { p, valueScore: scores.valueScore, avgScore: avg(p.scores) };
    })
    .sort(
      (a, b) =>
        b.valueScore - a.valueScore ||
        a.p.prices.reduce((s, x) => s + x, 0) / a.p.prices.length -
          b.p.prices.reduce((s, x) => s + x, 0) / b.p.prices.length
    )
    .slice(0, 8)
    .map((x, i) =>
      toRankingEntry(x.p, i + 1, x.avgScore, x.valueScore / 20, x.avgScore)
    );
}

type BrandAgg = {
  name: string;
  slug: string;
  scores: number[];
  recentScores: number[];
  previousScores: number[];
};

function aggregateBrands(
  currentReports: ReportRow[],
  previousReports: ReportRow[]
): BrandAgg[] {
  const map = new Map<string, BrandAgg>();

  for (const r of currentReports) {
    const slug = slugify(r.brand_name);
    const agg = map.get(slug) ?? {
      name: r.brand_name,
      slug,
      scores: [],
      recentScores: [],
      previousScores: [],
    };
    agg.recentScores.push(r.boof_score);
    agg.scores.push(r.boof_score);
    map.set(slug, agg);
  }

  for (const r of previousReports) {
    const slug = slugify(r.brand_name);
    const agg = map.get(slug) ?? {
      name: r.brand_name,
      slug,
      scores: [],
      recentScores: [],
      previousScores: [],
    };
    agg.previousScores.push(r.boof_score);
    map.set(slug, agg);
  }

  return [...map.values()];
}

export function buildRisingBrands(reports: ReportRow[]): RankingEntry[] {
  const thisWeek = filterByWindow(reports, WEEK_MS);
  const lastWeek = filterPreviousWindow(reports, WEEK_MS);
  const brands = aggregateBrands(thisWeek, lastWeek);

  return brands
    .filter((b) => b.recentScores.length >= 1)
    .map((b) => {
      const current = avg(b.recentScores);
      const previous = b.previousScores.length
        ? avg(b.previousScores)
        : current - 0.4;
      return { b, current, movement: current - previous };
    })
    .filter((x) => x.movement > 0)
    .sort((a, b) => b.movement - a.movement || b.current - a.current)
    .slice(0, 6)
    .map((x, i) => ({
      id: x.b.slug,
      rank: i + 1,
      productName: x.b.name,
      brandName: x.b.name,
      brandSlug: x.b.slug,
      productSlug: x.b.slug,
      score: Math.round(x.current * 10) / 10,
      movement: Math.round(x.movement * 10) / 10,
      reportCount: x.b.recentScores.length,
      productType: "brand",
    }));
}

export function buildFallingBrands(reports: ReportRow[]): RankingEntry[] {
  const thisWeek = filterByWindow(reports, WEEK_MS);
  const lastWeek = filterPreviousWindow(reports, WEEK_MS);
  const brands = aggregateBrands(thisWeek, lastWeek);

  return brands
    .filter((b) => b.recentScores.length >= 1)
    .map((b) => {
      const current = avg(b.recentScores);
      const previous = b.previousScores.length
        ? avg(b.previousScores)
        : current + 0.4;
      return { b, current, movement: current - previous };
    })
    .filter((x) => x.movement < 0)
    .sort((a, b) => a.movement - b.movement || a.current - b.current)
    .slice(0, 6)
    .map((x, i) => ({
      id: x.b.slug,
      rank: i + 1,
      productName: x.b.name,
      brandName: x.b.name,
      brandSlug: x.b.slug,
      productSlug: x.b.slug,
      score: Math.round(x.current * 10) / 10,
      movement: Math.round(x.movement * 10) / 10,
      reportCount: x.b.recentScores.length,
      productType: "brand",
    }));
}

export function findProductScores(
  reports: ReportRow[],
  productSlug: string
): (IntelligenceScores & {
  productName: string;
  brandName: string;
  reportCount: number;
}) | null {
  const products = aggregateProducts(reports);
  const product = products.find((p) => p.productSlug === productSlug);
  if (!product) return null;

  const scores = computeScores(product);
  return {
    productName: product.productName,
    brandName: product.brandName,
    reportCount: product.scores.length,
    ...scores,
  };
}
