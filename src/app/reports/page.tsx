import { preloadApprovedMeetupReports, preloadApprovedReports } from "@/lib/convex/queries";
import {
  getSeedApprovedMeetupReports,
  getSeedApprovedReports,
} from "@/lib/convex/seed";
import { buildPageMetadata } from "@/lib/seo";
import { ReportsClient } from "./ReportsClient";

export const metadata = buildPageMetadata({
  title: "Live Cannabis Reports — Michigan",
  description:
    "Browse real-time Michigan cannabis reports — boof alerts, fire finds, mold warnings, and taxed product flags from real buyers. Free community intel, no signup required.",
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
