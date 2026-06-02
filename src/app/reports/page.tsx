import {
  preloadApprovedMeetupReports,
  preloadApprovedReports,
} from "@/lib/convex/queries";
import { allowLocalSeedFallback } from "@/lib/convex/config";
import {
  getSeedApprovedMeetupReports,
  getSeedApprovedReports,
} from "@/lib/convex/seed";
import { buildPageMetadata } from "@/lib/seo";
import { ReportsClient } from "./ReportsClient";

export const metadata = buildPageMetadata({
  title: "Map & Reports — Michigan Intel Hub",
  description:
    "Tactical Michigan cannabis map plus analytical community reports — boof alerts, fire finds, mold warnings, and full buyer signals. Free community intel.",
  path: "/reports",
});

export default async function ReportsPage() {
  const seedReports = allowLocalSeedFallback() ? getSeedApprovedReports() : [];
  const seedMeetupReports = allowLocalSeedFallback()
    ? getSeedApprovedMeetupReports()
    : [];
  const [preloadedReports, preloadedMeetupReports] = await Promise.all([
    preloadApprovedReports(),
    preloadApprovedMeetupReports(),
  ]);

  return (
    <ReportsClient
      preloadedReports={preloadedReports}
      preloadedMeetupReports={preloadedMeetupReports}
      seedReports={seedReports}
      seedMeetupReports={seedMeetupReports}
    />
  );
}
