import type { Metadata } from "next";
import { HomePageJsonLd } from "@/components/seo/HomePageSeo";
import { HomeClient } from "./HomeClient";
import {
  preloadApprovedMeetupReports,
  preloadApprovedReports,
} from "@/lib/convex/queries";
import { allowLocalSeedFallback } from "@/lib/convex/config";
import {
  getSeedApprovedMeetupReports,
  getSeedApprovedReports,
} from "@/lib/convex/seed";
import { buildPageMetadata, SITE_DESCRIPTION_LONG } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Michigan Cannabis Map & Community Reports",
  description: SITE_DESCRIPTION_LONG,
  path: "/",
});

export default async function HomePage() {
  const seedReports = allowLocalSeedFallback() ? getSeedApprovedReports() : [];
  const seedMeetupReports = allowLocalSeedFallback()
    ? getSeedApprovedMeetupReports()
    : [];
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
