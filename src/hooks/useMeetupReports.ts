"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { isConvexConfigured } from "@/lib/convex/config";
import { getSeedApprovedMeetupReports } from "@/lib/convex/seed";
import { mergeMeetupFeed } from "@/lib/data/mergeMeetupFeed";
import { useAuth } from "@/components/BoofAuthProvider";
import type { MeetupReport } from "@/lib/types";

export function useMeetupReports(): MeetupReport[] {
  const { isAuthenticated } = useAuth();
  const configured = isConvexConfigured();
  const approved = useQuery(
    api.meetupReports.listApproved,
    configured ? {} : "skip"
  );
  const mine = useQuery(
    api.meetupReports.listMine,
    configured && isAuthenticated ? {} : "skip"
  );

  const seed = getSeedApprovedMeetupReports();
  if (!configured) return seed;
  if (approved === undefined) return seed;

  return mergeMeetupFeed(approved as MeetupReport[], mine as MeetupReport[] | undefined);
}
