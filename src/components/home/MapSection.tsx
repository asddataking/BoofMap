"use client";

import { TacticalMapPanel } from "@/components/home/TacticalMapPanel";
import { SectionHeader } from "./intelligence/SectionHeader";
import type { MeetupReport, Report } from "@/lib/types";

export function MapSection({
  reports,
  meetups = [],
}: {
  reports: Report[];
  meetups?: MeetupReport[];
}) {
  return (
    <section aria-label="Intel map">
      <SectionHeader
        kicker="Geographic Intel"
        title="Live Intel Map"
        subtitle="Community reports plotted across Michigan — fire finds, boof alerts, and hot zones."
        href="/reports"
        linkLabel="Open full map"
      />
      <div className="min-h-[280px] lg:min-h-[360px]">
        <TacticalMapPanel reports={reports} meetups={meetups} />
      </div>
    </section>
  );
}
