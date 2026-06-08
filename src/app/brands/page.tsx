import Link from "next/link";
import { fetchBrandNames } from "@/lib/convex/queries";
import { AppShell } from "@/components/AppShell";
import { PageTransition } from "@/components/PageTransition";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { slugify } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildPageMetadata,
  LAUNCH_STATE,
  SEO_COPY_SNIPPETS,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

const BRANDS_DESCRIPTION = `Strain and brand analytics from real cannabis consumers — community trust scores, quality reports, and verified product signals. ${SEO_COPY_SNIPPETS.legalMarkets} Launching in ${LAUNCH_STATE}.`;

export const metadata = buildPageMetadata({
  title: "Strain & Brand Analytics — Cannabis Quality Reports",
  description: BRANDS_DESCRIPTION,
  path: "/brands",
});

export default async function BrandsPage() {
  const brands = await fetchBrandNames();

  return (
    <AppShell>
      <JsonLdScript
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Brands", path: "/brands" },
        ])}
      />
      <JsonLdScript
        data={buildCollectionPageJsonLd({
          name: "BoofMap Cannabis Brand Analytics",
          description: BRANDS_DESCRIPTION,
          path: "/brands",
        })}
      />
      <PageTransition>
        <div className="py-4 lg:py-8">
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Strain &amp; Brand Analytics
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
            {SEO_COPY_SNIPPETS.realReports}{" "}
            {SEO_COPY_SNIPPETS.trackProducts}
          </p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            <Link href="/reports" className="text-emerald-500 hover:underline">
              Browse live reports
            </Link>
            {" · "}
            <Link href="/report" className="text-emerald-500 hover:underline">
              Submit a report
            </Link>
          </p>
          <ul className="mt-6 space-y-2">
            {brands.map((name) => (
              <li key={name}>
                <Link
                  href={`/brands/${slugify(name)}`}
                  className="glass-card flex items-center justify-between px-4 py-3.5 transition hover:border-[var(--border-soft)]"
                >
                  <span className="font-medium text-white">{name}</span>
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </PageTransition>
    </AppShell>
  );
}
