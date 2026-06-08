import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageTransition } from "@/components/PageTransition";
import { ReportCard } from "@/components/ReportCard";
import { BoofMapIntelligenceSection } from "@/components/brands/BoofMapIntelligenceSection";
import { BrandForecastPulse } from "@/components/forecast/ForecastPulseBlock";
import { ScoreBadge } from "@/components/ScoreBadge";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { BreadcrumbJsonLd } from "@/components/SiteJsonLd";
import { fetchBrandProfile } from "@/lib/convex/queries";
import { buildBrandJsonLd, buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await fetchBrandProfile(slug);
  if (!brand) {
    return buildPageMetadata({ title: "Brand not found", noIndex: true });
  }

  return buildPageMetadata({
    title: `${brand.name} — Strain & Brand Analytics`,
    description: `${brand.name} cannabis quality reports on BoofMap — ${brand.report_count} community reviews, trust score ${brand.trust_score}. Verified product signals, strain reviews, and buyer intel from real consumers.`,
    path: `/brands/${slug}`,
  });
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = await fetchBrandProfile(slug);
  if (!brand) notFound();

  return (
    <AppShell>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Brands", path: "/brands" },
          { name: brand.name, path: `/brands/${slug}` },
        ]}
      />
      <JsonLdScript
        data={buildBrandJsonLd({
          name: brand.name,
          slug,
          trust_score: brand.trust_score,
          report_count: brand.report_count,
          avg_boof_score: brand.avg_boof_score,
        })}
      />
      <PageTransition>
        <div className="py-4">
          <Link href="/brands" className="text-xs text-[var(--text-muted)] hover:text-[var(--text-muted)]">
            ← All brands
          </Link>
          <h1 className="mt-2 font-display text-2xl font-bold text-white">
            {brand.name}
          </h1>

          {brand.mold_report_count > 0 && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-300">
                  Reported mold concern
                </p>
                <p className="mt-1 text-xs text-red-400/80">
                  {brand.mold_report_count} community report
                  {brand.mold_report_count > 1 ? "s" : ""} flagged a possible mold
                  concern. Always inspect products yourself.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="glass-card p-4">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Trust score
              </p>
              <p className="mt-1 font-heading text-3xl font-bold text-emerald-400">
                {brand.trust_score}
              </p>
            </div>
            <div className="glass-card p-4">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Avg Boof Score
              </p>
              <div className="mt-2">
                <ScoreBadge score={brand.avg_boof_score} />
              </div>
            </div>
            <div className="glass-card col-span-2 p-4">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Most common reported issue
              </p>
              <p className="mt-1 text-sm text-[var(--text-main)]">
                {brand.top_complaint ?? "No major pattern yet"}
              </p>
            </div>
          </div>

          <section className="mt-8">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Product breakdown
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(brand.product_breakdown).map(([type, count]) => (
                <span
                  key={type}
                  className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] px-3 py-1.5 text-xs capitalize text-[var(--text-muted)]"
                >
                  {type}: {count}
                </span>
              ))}
            </div>
          </section>

          <BoofMapIntelligenceSection brandName={brand.name} brandSlug={slug} />

          <BrandForecastPulse brandSlug={slug} />

          <section className="mt-8">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Recent community reports
            </h3>
            <div className="mt-4 space-y-4">
              {brand.recent_reports.map((r, i) => (
                <ReportCard key={r.id} report={r} index={i} compact />
              ))}
            </div>
          </section>
        </div>
      </PageTransition>
    </AppShell>
  );
}
