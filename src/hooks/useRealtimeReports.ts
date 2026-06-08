"use client";

import { usePreloadedQuery, type Preloaded } from "convex/react";
import { api } from "../../convex/_generated/api";
import { resolveFeedList } from "@/lib/data/resolveFeed";
import type { Report } from "@/lib/types";

export function usePreloadedReports(
  preloaded: Preloaded<typeof api.reports.listApproved>,
  seedFallback: Report[]
): Report[] {
  const live = usePreloadedQuery(preloaded);
  return resolveFeedList(live as Report[] | undefined, seedFallback);
}
