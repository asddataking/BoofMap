import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { FaqSection } from "@/components/FaqSection";
import { PageTransition } from "@/components/PageTransition";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { buildFaqJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "FAQ — Cannabis Transparency & Community Reports",
  description:
    "FAQ about BoofMap — the community-powered cannabis transparency platform. Real weed reviews, quality reports, legal market coverage, Michigan launch, and how we differ from menu apps.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <AppShell>
      <JsonLdScript data={buildFaqJsonLd()} />
      <PageTransition>
        <div className="py-6 lg:py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition hover:text-[#39FF88]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>

          <header className="mt-6 max-w-2xl">
            <p className="section-kicker">Help</p>
            <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-[var(--text-main)] sm:text-4xl">
              FAQ
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              Answers about BoofMap, cannabis transparency, community reporting,
              and how we differ from pay-to-play dispensary directories.
            </p>
          </header>

          <div className="mt-10 max-w-3xl">
            <FaqSection />
          </div>

          <p className="mt-10 text-sm text-[var(--text-muted)]">
            Still have questions?{" "}
            <Link href="/report" className="text-[#39FF88] hover:underline">
              Submit a report
            </Link>{" "}
            or email{" "}
            <a
              href="mailto:press@boofmap.com"
              className="text-[#39FF88] hover:underline"
            >
              press@boofmap.com
            </a>
            .
          </p>
        </div>
      </PageTransition>
    </AppShell>
  );
}
