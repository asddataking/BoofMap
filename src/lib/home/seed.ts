import { getSeedApprovedMeetupReports, getSeedApprovedReports } from "@/lib/convex/seed";
import type {
  AlertPreviewSettings,
  MarketMover,
  RankingEntry,
  RankingType,
  TickerItem,
  UserProfile,
} from "@/lib/types";
import {
  buildRankingsFromReports,
  buildTickerFromData,
} from "./rankings";
import { slugify } from "@/lib/utils";

function mapDerivedTicker(
  item: ReturnType<typeof buildTickerFromData>[number]
): TickerItem {
  const typeMap = {
    report: "fire" as const,
    alert: "warning" as const,
    rank: "ranking" as const,
    meetup: "warning" as const,
  };
  const parts = item.detail.split(" · ");
  return {
    id: item.id,
    title: item.label,
    type: typeMap[item.type],
    state: "MI",
    city: parts[2] ?? null,
    product_name: parts[0] ?? null,
    brand_name: parts[1] ?? null,
    severity: item.type === "alert" ? "elevated" : null,
    created_at: item.timestamp,
    is_active: true,
  };
}

export function getSeedTickerItems(): TickerItem[] {
  const reports = getSeedApprovedReports();
  const meetups = getSeedApprovedMeetupReports();
  const items = buildTickerFromData(reports, meetups).map(mapDerivedTicker);
  if (items.length) return items;
  return [
    {
      id: "demo-1",
      title: "FIRE FIND",
      type: "fire",
      state: "MI",
      city: "Detroit",
      product_name: "Local Grove Runtz",
      brand_name: "Local Grove",
      created_at: new Date().toISOString(),
      is_active: true,
    },
    {
      id: "demo-2",
      title: "MOLD WATCH",
      type: "warning",
      state: "MI",
      city: "Ann Arbor",
      product_name: "3 mold reports",
      brand_name: null,
      severity: "elevated",
      created_at: new Date().toISOString(),
      is_active: true,
    },
    {
      id: "demo-3",
      title: "BOOF ALERT",
      type: "alert",
      state: "MI",
      city: "Lansing",
      product_name: "Fake Hytek carts",
      brand_name: "Hytek",
      severity: "critical",
      created_at: new Date().toISOString(),
      is_active: true,
    },
    {
      id: "demo-4",
      title: "TOP STRAIN",
      type: "ranking",
      state: "MI",
      city: "Traverse City",
      product_name: "Frosted Kush",
      brand_name: "Peninsula Gardens",
      created_at: new Date().toISOString(),
      is_active: true,
    },
  ];
}

export function mapApiRankingToEntry(row: {
  id: string;
  rank?: number;
  product_name: string;
  brand_name?: string | null;
  score: number;
  movement: number;
  report_count: number;
  trend?: string;
  slug?: string;
}): RankingEntry {
  const name = row.brand_name ?? row.product_name;
  return {
    id: row.id,
    rank: row.rank ?? 0,
    name,
    subtitle: row.brand_name
      ? `${row.product_name} · ${row.report_count} reports`
      : `${row.report_count} reports`,
    score: row.score,
    change: row.movement,
    report_count: row.report_count,
    slug: row.slug ?? slugify(name),
    kind: row.brand_name ? "brand" : "product",
    trend: row.trend,
  };
}

export function getSeedRankings(type: RankingType): RankingEntry[] {
  return buildRankingsFromReports(getSeedApprovedReports(), type).map(
    (entry, i) => ({
      ...entry,
      rank: i + 1,
      kind: entry.kind as RankingEntry["kind"],
    })
  );
}

export function getSeedMarketMovers(): {
  trending: MarketMover[];
  falling: MarketMover[];
} {
  const fire = getSeedRankings("fire_right_now");
  const fallers = getSeedRankings("biggest_fallers");
  return {
    trending: fire.slice(0, 4).map((r) => ({
      id: r.id,
      name: r.name,
      subtitle: r.subtitle ?? "",
      score: r.score,
      change: r.change ?? 0.5,
      slug: r.slug,
      kind: "brand" as const,
    })),
    falling: fallers.slice(0, 4).map((r) => ({
      id: r.id,
      name: r.name,
      subtitle: r.subtitle ?? "",
      score: r.score,
      change: r.change ?? -0.8,
      slug: r.slug,
      kind: "brand" as const,
    })),
  };
}

export function getSeedUserProfile(): UserProfile {
  return {
    user_id: "demo-smoke-gm",
    display_name: "Smoke GM",
    role_title: "Field Analyst",
    level: 7,
    points: 847,
    report_count: 23,
    streak_count: 12,
    accuracy_score: 92,
    badges: ["Early Reporter", "Boof Hunter", "Fire Scout"],
    updated_at: new Date().toISOString(),
  };
}

export function getSeedAlertSettings(): AlertPreviewSettings {
  return {
    boof_alerts: true,
    taxed_alerts: true,
    fire_finds: false,
    meetup_warnings: true,
    city: "Detroit, MI",
  };
}
