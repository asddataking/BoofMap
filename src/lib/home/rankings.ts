import type { MeetupReport, RankingEntry, RankingType, Report } from "@/lib/types";
import { getMarkerTier } from "@/lib/markers";
import { slugify } from "@/lib/utils";

type BrandAgg = {
  name: string;
  scores: number[];
  prices: number[];
  confirms: number;
  fraudTags: number;
  recentMs: number;
};

function aggregateBrands(reports: Report[]): BrandAgg[] {
  const map = new Map<string, BrandAgg>();
  for (const r of reports) {
    const key = r.brand_name;
    const agg = map.get(key) ?? {
      name: key,
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
    map.set(key, agg);
  }
  return [...map.values()];
}

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function toEntry(
  agg: BrandAgg,
  rank: number,
  score: number,
  change?: number
): RankingEntry {
  return {
    id: slugify(agg.name),
    rank,
    name: agg.name,
    subtitle: `${agg.scores.length} reports`,
    score: Math.round(score * 10) / 10,
    change,
    report_count: agg.scores.length,
    slug: slugify(agg.name),
    kind: "brand",
  };
}

export function buildRankingsFromReports(
  reports: Report[],
  type: RankingType
): RankingEntry[] {
  const brands = aggregateBrands(reports);
  let sorted: BrandAgg[];

  switch (type) {
    case "fire_right_now":
      sorted = brands
        .filter((b) => avg(b.scores) >= 4)
        .sort(
          (a, b) =>
            avg(b.scores) - avg(a.scores) || b.recentMs - a.recentMs
        );
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
      return sorted.slice(0, 8).map((b, i) =>
        toEntry(b, i + 1, avg(b.scores))
      );

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

export function buildTickerFromData(
  reports: Report[],
  meetups: MeetupReport[] = []
) {
  const items = [
    ...reports.slice(0, 6).map((r) => {
      const tier = getMarkerTier(r);
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
        type: (tier === "boof" || tier === "taxed"
          ? "alert"
          : "report") as "alert" | "report",
        timestamp: r.created_at,
      };
    }),
    ...meetups.slice(0, 3).map((m) => ({
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
