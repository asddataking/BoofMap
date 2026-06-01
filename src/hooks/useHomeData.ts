"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexConfigured } from "@/lib/convex/config";
import {
  getSeedAlertSettings,
  getSeedMarketMovers,
  getSeedRankings,
  getSeedTickerItems,
  getSeedUserProfile,
} from "@/lib/home/seed";
import type { RankingEntry, RankingType, TickerItem, UserProfile } from "@/lib/types";

function normalizeTickerItem(
  item: TickerItem | {
    id: string;
    label?: string;
    detail?: string;
    type: string;
    timestamp?: string;
    created_at?: string;
    title?: string;
  }
): TickerItem {
  if ("title" in item && item.title && !("label" in item && item.label)) {
    return item as TickerItem;
  }

  const label = ("label" in item && item.label) || item.title || "LIVE";
  const detail = ("detail" in item && item.detail) || "";
  const parts = detail.split(" · ");
  const rawType = item.type;

  return {
    id: item.id,
    title: label,
    type:
      rawType === "alert" || rawType === "warning"
        ? "warning"
        : rawType === "meetup"
          ? "warning"
          : rawType === "fire" || rawType === "fresh_drop" || rawType === "ranking"
            ? rawType
            : "fire",
    state: "MI",
    product_name: parts[0] || null,
    brand_name: parts[1] || null,
    city: parts[2] || null,
    created_at:
      ("timestamp" in item && item.timestamp) ||
      item.created_at ||
      new Date().toISOString(),
    is_active: true,
  };
}

export function useTickerItems(): TickerItem[] {
  const configured = isConvexConfigured();
  const live = useQuery(
    api.ticker.listActiveTickerItems,
    configured ? {} : "skip"
  );
  const items = live ?? getSeedTickerItems();
  return items.map(normalizeTickerItem);
}

export function useRankingsByType(type: RankingType): RankingEntry[] {
  const configured = isConvexConfigured();
  const live = useQuery(
    api.rankings.listRankingsByType,
    configured ? { type } : "skip"
  );
  if (!live) return getSeedRankings(type);
  return live.map((row, i) => ({
    ...row,
    rank: row.rank ?? i + 1,
    kind: (row.kind ?? "brand") as RankingEntry["kind"],
  }));
}

export function useMarketMovers() {
  const configured = isConvexConfigured();
  const live = useQuery(api.rankings.getMarketMovers, configured ? {} : "skip");
  return live ?? getSeedMarketMovers();
}

export function useCurrentUserProfile(): UserProfile | null {
  const configured = isConvexConfigured();
  const live = useQuery(
    api.users.getCurrentUserProfile,
    configured ? {} : "skip"
  );
  if (live === null) return null;
  if (live === undefined) return getSeedUserProfile();
  return live as UserProfile;
}

export function useAlertPreviewSettings() {
  return getSeedAlertSettings();
}
