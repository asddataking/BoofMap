import {
  preloadApprovedMeetupReports,
  preloadApprovedReports,
} from "@/lib/convex/queries";
import {
  getSeedApprovedMeetupReports,
  getSeedApprovedReports,
} from "@/lib/convex/seed";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildPageMetadata,
  LAUNCH_STATE,
} from "@/lib/seo";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { ReportsClient } from "./ReportsClient";

export const dynamic = "force-dynamic";

const REPORTS_DESCRIPTION = `Live cannabis transparency reports from the BoofMap community. Real weed reviews, quality signals, and verified buyer intel from legal markets nationwide — launching in ${LAUNCH_STATE}.`;

export const metadata = buildPageMetadata({
  title: "Live Cannabis Reports & Legal Market Map",
  description: REPORTS_DESCRIPTION,
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
    <>
      <JsonLdScript
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Reports", path: "/reports" },
        ])}
      />
      <JsonLdScript
        data={buildCollectionPageJsonLd({
          name: "BoofMap Live Cannabis Reports",
          description: REPORTS_DESCRIPTION,
          path: "/reports",
        })}
      />
      <ReportsClient
        preloadedReports={preloadedReports}
        preloadedMeetupReports={preloadedMeetupReports}
        seedReports={seedReports}
        seedMeetupReports={seedMeetupReports}
      />
    </>
  );
}
