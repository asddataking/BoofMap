import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { PageTransition } from "@/components/PageTransition";
import { ReportCard } from "@/components/ReportCard";
import { ProductForecastPulse } from "@/components/forecast/ForecastPulseBlock";
import { ProductScoreBreakdown } from "@/components/products/ProductScoreBreakdown";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BreadcrumbJsonLd } from "@/components/SiteJsonLd";
import { fetchProductProfile } from "@/lib/convex/queries";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductProfile(slug);
  if (!product) {
    return buildPageMetadata({ title: "Product not found", noIndex: true });
  }

  return buildPageMetadata({
    title: `${product.product_name} by ${product.brand_name} — Product Intelligence`,
    description: `${product.product_name} community intelligence on BoofMap — ${product.report_count} reports, community score ${product.community_score}, flavor ${product.flavor_score}, burn ${product.burn_score}. Real consumer cannabis product signals.`,
    path: `/products/${slug}`,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProductProfile(slug);
  if (!product) notFound();

  return (
    <AppShell>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: product.brand_name, path: `/brands/${product.brand_slug}` },
          { name: product.product_name, path: `/products/${slug}` },
        ]}
      />
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.product_name,
          brand: { "@type": "Brand", name: product.brand_name },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.avg_boof_score,
            bestRating: 5,
            ratingCount: product.report_count,
          },
        }}
      />
      <PageTransition>
        <div className="py-4">
          <Link
            href={`/brands/${product.brand_slug}`}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)]"
          >
            ← {product.brand_name}
          </Link>

          <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="section-kicker !mb-1">Product Intelligence</p>
              <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-[var(--text-main)] sm:text-3xl">
                {product.product_name}
              </h1>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                by{" "}
                <Link
                  href={`/brands/${product.brand_slug}`}
                  className="font-semibold text-[#39FF88] hover:underline"
                >
                  {product.brand_name}
                </Link>
                <span className="mx-2 text-[var(--border-soft)]">·</span>
                <span className="capitalize">{product.product_type}</span>
              </p>
            </div>
          </div>

          <div className="mt-8">
            <ProductScoreBreakdown product={product} />
          </div>

          <ProductForecastPulse
            productSlug={slug}
            bullishPercent={product.forecast_bullish_percent}
          />

          <section className="mt-10">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Community reports
            </h2>
            <div className="mt-4 space-y-4">
              {product.recent_reports.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  No reports yet for this product.
                </p>
              ) : (
                product.recent_reports.map((r, i) => (
                  <ReportCard key={r.id} report={r} index={i} compact />
                ))
              )}
            </div>
          </section>

          <section className="mt-8 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-5">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              API Access
            </p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Embed BoofMap intelligence on your site or pull live product data
              via the public API.
            </p>
            <code className="mt-3 block overflow-x-auto rounded-lg bg-[var(--bg-elevated)] px-3 py-2 text-xs text-[#39FF88]">
              GET /api/products/{slug}/intelligence
            </code>
          </section>
        </div>
      </PageTransition>
    </AppShell>
  );
}
