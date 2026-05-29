import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Submit Report",
  description:
    "Report boof, mold, taxed prices, and fake sales. Help the Michigan cannabis community find fire and avoid trash product.",
  path: "/report",
});

export default function ReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
