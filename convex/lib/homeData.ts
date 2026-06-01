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
  created_at: string;
};

type MeetupRow = {
  id: string;
  seller_display_name: string;
  city: string;
  platform: string;
  created_at: string;
};

type BrandAgg = {
  name: string;
  scores: number[];
  prices: number[];
  confirms: number;
  fraudTags: number;
  recentMs: number;
};

export type RankingType =
  | "fire_right_now"
  | "biggest_fallers"
  | "most_reported"
  | "budget_bargers"
  | "fraud_watch";

function avg(nums: number[]) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function aggregateBrands(reports: ReportRow[]): BrandAgg[] {
  const map = new Map<string, BrandAgg>();
  for (const r of reports) {
    const agg = map.get(r.brand_name) ?? {
      name: r.brand_name,
      scores: [],
      prices: [],
      confirms: 0,
      fraudTags: 0,
      recentMs: 0,
    };
    agg.scores.push(r.boof_score);
    if (r.price_paid != null) agg.prices.push(r.price_paid);
    agg.confirms += r.confirm_count ?? 0;
    if (
      r.issue_tags.some((t) =>
        ["Mold", "CRC Garbage", "Leaking Cart", "Fake Sale"].includes(t)
      )
    ) {
      agg.fraudTags += 1;
    }
    agg.recentMs = Math.max(agg.recentMs, new Date(r.created_at).getTime());
    map.set(r.brand_name, agg);
  }
  return [...map.values()];
}

function toEntry(agg: BrandAgg, rank: number, score: number, change?: number) {
  return {
    id: slugify(agg.name),
    rank,
    name: agg.name,
    subtitle: `${agg.scores.length} reports`,
    score: Math.round(score * 10) / 10,
    change,
    report_count: agg.scores.length,
    slug: slugify(agg.name),
    kind: "brand" as const,
  };
}

export function buildRankings(reports: ReportRow[], type: RankingType) {
  const brands = aggregateBrands(reports);
  let sorted: BrandAgg[];

  switch (type) {
    case "fire_right_now":
      sorted = brands
        .filter((b) => avg(b.scores) >= 4)
        .sort((a, b) => avg(b.scores) - avg(a.scores) || b.recentMs - a.recentMs);
      return sorted.slice(0, 8).map((b, i) =>
        toEntry(b, i + 1, avg(b.scores), +(avg(b.scores) - 3.5).toFixed(1))
      );
    case "biggest_fallers":
      sorted = brands
        .filter((b) => avg(b.scores) <= 3)
        .sort((a, b) => avg(a.scores) - avg(b.scores) || b.confirms - a.confirms);
      return sorted.slice(0, 8).map((b, i) =>
        toEntry(b, i + 1, avg(b.scores), -(3.5 - avg(b.scores)).toFixed(1))
      );
    case "most_reported":
      sorted = brands.sort(
        (a, b) => b.scores.length - a.scores.length || b.confirms - a.confirms
      );
      return sorted.slice(0, 8).map((b, i) => toEntry(b, i + 1, avg(b.scores)));
    case "budget_bargers":
      sorted = brands
        .filter((b) => b.prices.length > 0 && avg(b.scores) >= 3.5)
        .sort(
          (a, b) =>
            avg(a.prices) - avg(b.prices) || avg(b.scores) - avg(a.scores)
        );
      return sorted.slice(0, 8).map((b, i) =>
        toEntry(
          b,
          i + 1,
          avg(b.scores),
          +(avg(b.scores) - avg(b.prices) / 20).toFixed(1)
        )
      );
    case "fraud_watch":
      sorted = brands
        .filter((b) => b.fraudTags > 0 || avg(b.scores) <= 2)
        .sort(
          (a, b) =>
            b.fraudTags - a.fraudTags ||
            avg(a.scores) - avg(b.scores) ||
            b.confirms - a.confirms
        );
      return sorted.slice(0, 8).map((b, i) =>
        toEntry(b, i + 1, avg(b.scores), -b.fraudTags * 0.5)
      );
  }
}

function markerTier(report: ReportRow) {
  const taxed = ["Overpriced / Taxed", "Fake Sale"];
  const boof = ["Mold", "CRC Garbage", "Leaking Cart"];
  if (report.issue_tags.some((t) => taxed.includes(t))) return "taxed";
  if (report.boof_score <= 2 || report.issue_tags.some((t) => boof.includes(t)))
    return "boof";
  if (report.boof_score >= 4) return "fire";
  return "mid";
}

export function buildTickerItems(reports: ReportRow[], meetups: MeetupRow[]) {
  const items = [
    ...reports.slice(0, 8).map((r) => {
      const tier = markerTier(r);
      return {
        id: `t-${r.id}`,
        label:
          tier === "fire"
            ? "FIRE FIND"
            : tier === "boof"
              ? "BOOF ALERT"
              : tier === "taxed"
                ? "TAXED"
                : "NEW REPORT",
        detail: `${r.strain_name} · ${r.brand_name} · ${r.city}`,
        type: tier === "boof" || tier === "taxed" ? ("alert" as const) : ("report" as const),
        timestamp: r.created_at,
      };
    }),
    ...meetups.slice(0, 4).map((m) => ({
      id: `t-${m.id}`,
      label: "MEETUP FLAG",
      detail: `${m.seller_display_name} · ${m.city} · ${m.platform}`,
      type: "meetup" as const,
      timestamp: m.created_at,
    })),
  ];
  return items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function buildMarketMovers(reports: ReportRow[]) {
  const trending = buildRankings(reports, "fire_right_now").slice(0, 4).map((r) => ({
    id: r.id,
    name: r.name,
    subtitle: r.subtitle ?? "",
    score: r.score,
    change: r.change ?? 0.5,
    slug: r.slug,
    kind: r.kind,
  }));
  const falling = buildRankings(reports, "biggest_fallers").slice(0, 4).map((r) => ({
    id: r.id,
    name: r.name,
    subtitle: r.subtitle ?? "",
    score: r.score,
    change: r.change ?? -0.8,
    slug: r.slug,
    kind: r.kind,
  }));
  return { trending, falling };
}
