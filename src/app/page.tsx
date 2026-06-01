import type { Metadata } from "next";
import { HomePageJsonLd } from "@/components/seo/HomePageSeo";
import { HomeClient } from "./HomeClient";
import { preloadApprovedReports } from "@/lib/convex/queries";
import { allowLocalSeedFallback } from "@/lib/convex/config";
import { getSeedApprovedReports } from "@/lib/convex/seed";
import { buildPageMetadata, SITE_DESCRIPTION_LONG } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Michigan Cannabis Map & Community Reports",
  description: SITE_DESCRIPTION_LONG,
  path: "/",
});

export default async function HomePage() {
  const seedReports = allowLocalSeedFallback() ? getSeedApprovedReports() : [];
  const preloadedReports = await preloadApprovedReports();

  return (
    <>
      <HomePageJsonLd />
      <HomeClient
        preloadedReports={preloadedReports}
        seedReports={seedReports}
      />
    </>
  );
}
