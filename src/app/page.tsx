import type { Metadata } from "next";
import { HomePageJsonLd } from "@/components/seo/HomePageSeo";
import { HomeClient } from "./HomeClient";
import {
  preloadApprovedMeetupReports,
  preloadApprovedReports,
} from "@/lib/convex/queries";
import {
  getSeedApprovedMeetupReports,
  getSeedApprovedReports,
} from "@/lib/convex/seed";
import { buildPageMetadata, SITE_DESCRIPTION_LONG } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Cannabis Transparency Platform & Community Reports",
  description: SITE_DESCRIPTION_LONG,
  path: "/",
});

export default async function HomePage() {
  const seedReports = getSeedApprovedReports();
  const seedMeetupReports = getSeedApprovedMeetupReports();
  const [preloadedReports, preloadedMeetupReports] = await Promise.all([
    preloadApprovedReports(),
    preloadApprovedMeetupReports(),
  ]);

  return (
    <>
      <HomePageJsonLd />
      <HomeClient
        preloadedReports={preloadedReports}
        preloadedMeetupReports={preloadedMeetupReports}
        seedReports={seedReports}
        seedMeetupReports={seedMeetupReports}
      />
    </>
  );
}
