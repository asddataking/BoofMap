import { preloadApprovedMeetupReports, preloadApprovedReports } from "@/lib/convex/queries";
import {
  getSeedApprovedMeetupReports,
  getSeedApprovedReports,
} from "@/lib/convex/seed";
import { buildPageMetadata } from "@/lib/seo";
import { ReportsClient } from "./ReportsClient";

export const metadata = buildPageMetadata({
  title: "Live Reports",
  description:
    "Browse real-time community cannabis reports across Michigan — product quality, taxed alerts, mold warnings, and fire finds. Free to browse, no signup required.",
  path: "/reports",
});

export default async function ReportsPage() {
  const seedReports = getSeedApprovedReports();
  const seedMeetupReports = getSeedApprovedMeetupReports();
  const [preloadedReports, preloadedMeetupReports] = await Promise.all([
    preloadApprovedReports(),
    preloadApprovedMeetupReports(),
  ]);

  return (
    <ReportsClient
      preloadedReports={preloadedReports}
      seedReports={seedReports}
      preloadedMeetupReports={preloadedMeetupReports}
      seedMeetupReports={seedMeetupReports}
    />
  );
}
