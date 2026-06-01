export { fetchApprovedMeetupReports } from "@/lib/convex/queries";

import type { MeetupReport } from "@/lib/types";

export function filterMeetupReports(
  reports: MeetupReport[],
  filterId: string,
  userLat?: number,
  userLng?: number
): MeetupReport[] {
  switch (filterId) {
    case "latest":
      return [...reports].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case "near":
      if (userLat == null || userLng == null) return reports;
      return [...reports].sort((a, b) => {
        const da = dist(userLat, userLng, a.latitude, a.longitude);
        const db = dist(userLat, userLng, b.latitude, b.longitude);
        return da - db;
      });
    case "scam":
      return reports.filter((r) => r.issue_tags.includes("Suspected Scam"));
    case "no-show":
      return reports.filter((r) => r.issue_tags.includes("No Show"));
    case "changed-price":
      return reports.filter((r) => r.issue_tags.includes("Changed Price"));
    case "unsafe":
      return reports.filter((r) => r.issue_tags.includes("Unsafe Meetup"));
    default:
      return reports;
  }
}

function dist(
  lat1: number,
  lng1: number,
  lat2?: number | null,
  lng2?: number | null
): number {
  if (lat2 == null || lng2 == null) return Infinity;
  return Math.hypot(lat1 - lat2, lng1 - lng2);
}
