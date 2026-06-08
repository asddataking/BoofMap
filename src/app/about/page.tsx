import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageTransition } from "@/components/PageTransition";
import { HomeSeoSections } from "@/components/seo/HomeSeoSections";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import {
  buildCollectionPageJsonLd,
  buildPageMetadata,
  SITE_DESCRIPTION_LONG,
} from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Community-Powered Cannabis Transparency",
  description:
    "Learn how BoofMap brings cannabis transparency to legal markets — real community reports, product intelligence, batch-level signals, and consumer protection. Launching in Michigan.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <AppShell>
      <JsonLdScript
        data={buildCollectionPageJsonLd({
          name: "BoofMap — Community-Powered Cannabis Transparency",
          description: SITE_DESCRIPTION_LONG,
          path: "/about",
        })}
      />
      <PageTransition>
        <div className="py-6 lg:py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition hover:text-[#39FF88]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>

          <div className="mt-6">
            <HomeSeoSections asPage />
          </div>
        </div>
      </PageTransition>
    </AppShell>
  );
}
