import type { Metadata } from "next";
import { HomePageSeoHead } from "@/components/seo/HomePageSeo";
import { HomeClient } from "./HomeClient";
import { preloadApprovedReports } from "@/lib/convex/queries";
import { getSeedApprovedReports } from "@/lib/convex/seed";
import { buildPageMetadata, SITE_DESCRIPTION_LONG } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Michigan Cannabis Map & Community Reports",
  description: SITE_DESCRIPTION_LONG,
  path: "/",
});

export default async function HomePage() {
  const seedReports = getSeedApprovedReports();
  const preloadedReports = await preloadApprovedReports();

  return (
    <HomeClient
      preloadedReports={preloadedReports}
      seedReports={seedReports}
      seoIntro={<HomePageSeoHead />}
    />
  );
}
