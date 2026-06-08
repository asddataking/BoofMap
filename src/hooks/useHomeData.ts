"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexConfigured } from "@/lib/convex/config";
import { resolveFeedList } from "@/lib/data/resolveFeed";
import {
  getSeedAlertSettings,
  getSeedMarketMovers,
  getSeedRankings,
  getSeedTickerItems,
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
  const items = resolveFeedList(
    live as TickerItem[] | undefined,
    getSeedTickerItems()
  );
  return items.map(normalizeTickerItem);
}

export function useRankingsByType(type: RankingType): RankingEntry[] {
  const configured = isConvexConfigured();
  const live = useQuery(
    api.rankings.listRankingsByType,
    configured ? { type } : "skip"
  );
  if (!live || live.length === 0) {
    return getSeedRankings(type);
  }
  return live.map((row, i) => ({
    ...row,
    rank: row.rank ?? i + 1,
    kind: (row.kind ?? "brand") as RankingEntry["kind"],
  }));
}

export function useMarketMovers() {
  const configured = isConvexConfigured();
  const live = useQuery(api.rankings.getMarketMovers, configured ? {} : "skip");
  if (live && (live.trending.length > 0 || live.falling.length > 0)) {
    return live;
  }
  return getSeedMarketMovers();
}

/** Signed-in analyst profile; `undefined` while loading, `null` when signed out or unavailable. */
export function useCurrentUserProfile(): UserProfile | null | undefined {
  const configured = isConvexConfigured();
  const live = useQuery(
    api.users.getCurrentUserProfile,
    configured ? {} : "skip"
  );
  if (!configured) return null;
  if (live === undefined) return undefined;
  if (live === null) return null;
  return live as UserProfile;
}

export function useAlertPreviewSettings() {
  return getSeedAlertSettings();
}
