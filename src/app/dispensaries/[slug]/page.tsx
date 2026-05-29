import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AlertTriangle, Flame } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageTransition } from "@/components/PageTransition";
import { ReportCard } from "@/components/ReportCard";
import { BreadcrumbJsonLd } from "@/components/SiteJsonLd";
import { fetchDispensaryProfile } from "@/lib/convex/queries";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dispo = await fetchDispensaryProfile(slug);
  if (!dispo) {
    return buildPageMetadata({ title: "Dispensary not found", noIndex: true });
  }

  return buildPageMetadata({
    title: `${dispo.name} — ${dispo.city}, MI`,
    description: `Community reports for ${dispo.name} in ${dispo.city}, Michigan. Value score ${dispo.value_score}, ${dispo.report_count} reports, ${dispo.taxed_alert_count} taxed alerts. See fire finds and recent boof reports.`,
    path: `/dispensaries/${slug}`,
  });
}

export default async function DispensaryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dispo = await fetchDispensaryProfile(slug);
  if (!dispo) notFound();

  return (
    <AppShell>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Reports", path: "/reports" },
          { name: dispo.name, path: `/dispensaries/${slug}` },
        ]}
      />
      <PageTransition>
        <div className="py-4">
          <p className="text-xs text-zinc-500">{dispo.city}</p>
          <h2 className="mt-1 font-heading text-2xl font-bold text-white">
            {dispo.name}
          </h2>

          {dispo.taxed_alert_count > 0 && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-orange-400" />
              <div>
                <p className="text-sm font-medium text-orange-300">
                  Taxed / overpriced alerts
                </p>
                <p className="mt-1 text-xs text-orange-400/80">
                  {dispo.taxed_alert_count} report
                  {dispo.taxed_alert_count > 1 ? "s" : ""} flagged pricing concerns.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="glass-card p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                Value score
              </p>
              <p className="mt-1 font-heading text-3xl font-bold text-amber-400">
                {dispo.value_score}
              </p>
            </div>
            <div className="glass-card p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                Avg reported price
              </p>
              <p className="mt-1 font-heading text-2xl font-bold text-zinc-200">
                ${dispo.avg_reported_price}
              </p>
            </div>
            <div className="glass-card col-span-2 p-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                Community sentiment
              </p>
              <p className="mt-1 text-sm capitalize text-zinc-300">
                {dispo.sentiment} · {dispo.report_count} reports
              </p>
            </div>
          </div>

          {dispo.fire_finds.length > 0 && (
            <section className="mt-8">
              <h3 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wider text-zinc-500">
                <Flame className="h-4 w-4 text-amber-400" />
                Fire finds
              </h3>
              <div className="mt-4 space-y-4">
                {dispo.fire_finds.map((r, i) => (
                  <ReportCard key={r.id} report={r} index={i} compact />
                ))}
              </div>
            </section>
          )}

          <section className="mt-8">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Recent community reports
            </h3>
            <div className="mt-4 space-y-4">
              {dispo.recent_reports.map((r, i) => (
                <ReportCard key={r.id} report={r} index={i} compact />
              ))}
            </div>
          </section>

          <Link
            href="/reports"
            className="mt-8 block text-center text-sm text-emerald-400 hover:text-emerald-300"
          >
            View all reports →
          </Link>
        </div>
      </PageTransition>
    </AppShell>
  );
}
