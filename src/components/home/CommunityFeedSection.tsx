"use client";

import Link from "next/link";
import { AnalyticalReportCard } from "@/components/AnalyticalReportCard";
import { SectionHeader } from "./intelligence/SectionHeader";
import type { MeetupReport, Report } from "@/lib/types";

export function CommunityFeedSection({
  reports,
  meetups = [],
}: {
  reports: Report[];
  meetups?: MeetupReport[];
}) {
  const feed = [...reports]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 8);

  return (
    <section aria-label="Live community feed">
      <SectionHeader
        kicker="Real-Time Intel"
        title="Live Community Feed"
        subtitle="Convex-powered report stream from verified community analysts."
        href="/reports"
        linkLabel="Full feed"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {feed.map((report, i) => (
          <AnalyticalReportCard key={report.id} report={report} index={i} />
        ))}
      </div>

      {meetups.length > 0 && (
        <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
          + {meetups.length} meetup signal{meetups.length !== 1 ? "s" : ""} on the{" "}
          <Link href="/reports" className="text-[#39FF88] hover:underline">
            intel map
          </Link>
        </p>
      )}
    </section>
  );
}
