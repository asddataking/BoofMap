"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexConfigured } from "@/lib/convex/config";
import { getSeedApprovedReports } from "@/lib/convex/seed";
import { resolveFeedList } from "@/lib/data/resolveFeed";
import type { Report } from "@/lib/types";

/** Approved reports for intel sections — live Convex data with seed fallback when sparse. */
export function useIntelligenceReports(): Report[] {
  const configured = isConvexConfigured();
  const live = useQuery(
    api.reports.listApproved,
    configured ? {} : "skip"
  ) as Report[] | undefined;

  return resolveFeedList(live, getSeedApprovedReports());
}
