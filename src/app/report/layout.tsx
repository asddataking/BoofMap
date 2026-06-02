import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Submit Cannabis Quality Report",
  description:
    "Submit a cannabis quality report — flag boof, mold, taxed prices, and fake sales. Help the community find fire and avoid bad weed. Real reports from real consumers, starting in Michigan.",
  path: "/report",
});

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
