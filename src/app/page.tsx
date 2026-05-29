import type { Metadata } from "next";
import { HomeClient } from "./HomeClient";
import { preloadApprovedReports } from "@/lib/convex/queries";
import { getSeedApprovedReports } from "@/lib/convex/seed";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Find fire. Avoid boof.",
  description:
    "Real cannabis reports from real people in Michigan. Browse community quality reports, explore the map, and find fire — no signup required.",
  path: "/",
});

export default async function HomePage() {
  const seedReports = getSeedApprovedReports();
  const preloadedReports = await preloadApprovedReports();

  return (
    <HomeClient preloadedReports={preloadedReports} seedReports={seedReports} />
  );
}
