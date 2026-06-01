"use client";

import { usePreloadedQuery, type Preloaded } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { MeetupReport } from "@/lib/types";

export function usePreloadedMeetupReports(
  preloaded: Preloaded<typeof api.meetupReports.listFeed>,
  seedFallback: MeetupReport[]
): MeetupReport[] {
  const live = usePreloadedQuery(preloaded);
  return (live ?? seedFallback) as MeetupReport[];
}
