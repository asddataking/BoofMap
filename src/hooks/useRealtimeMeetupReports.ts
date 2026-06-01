"use client";

import { usePreloadedQuery, useQuery, type Preloaded } from "convex/react";
import { api } from "../../convex/_generated/api";
import { mergeMeetupFeed } from "@/lib/data/mergeMeetupFeed";
import { useAuth } from "@/components/BoofAuthProvider";
import { isConvexConfigured } from "@/lib/convex/config";
import type { MeetupReport } from "@/lib/types";

export function usePreloadedMeetupReports(
  preloaded: Preloaded<typeof api.meetupReports.listApproved>,
  seedFallback: MeetupReport[]
): MeetupReport[] {
  const { isAuthenticated } = useAuth();
  const approved = usePreloadedQuery(preloaded);
  const mine = useQuery(
    api.meetupReports.listMine,
    isConvexConfigured() && isAuthenticated ? {} : "skip"
  );

  if (approved === undefined) {
    return seedFallback;
  }

  return mergeMeetupFeed(
    approved as MeetupReport[],
    mine as MeetupReport[] | undefined
  );
}
