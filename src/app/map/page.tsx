import type { Metadata } from "next";
import { MapPageClient } from "./MapPageClient";
import { preloadApprovedReports } from "@/lib/convex/queries";
import { getSeedApprovedReports } from "@/lib/convex/seed";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Tactical Intel Map — Michigan",
  description:
    "Full-screen Michigan cannabis intel map. Browse fire finds, boof alerts, dispensary pins, and seller flags from the BoofMap community.",
  path: "/map",
});

export default async function MapPage() {
  const seedReports = getSeedApprovedReports();
  const preloadedReports = await preloadApprovedReports();

  return (
    <MapPageClient
      preloadedReports={preloadedReports}
      seedReports={seedReports}
    />
  );
}
