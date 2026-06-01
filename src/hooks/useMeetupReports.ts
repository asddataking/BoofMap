"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexConfigured } from "@/lib/convex/config";
import { getSeedApprovedMeetupReports } from "@/lib/convex/seed";
import type { MeetupReport } from "@/lib/types";

export function useMeetupReports(): MeetupReport[] {
  const configured = isConvexConfigured();
  const live = useQuery(
    api.meetupReports.listFeed,
    configured ? { limit: 200 } : "skip"
  );
  return (live ?? getSeedApprovedMeetupReports()) as MeetupReport[];
}
