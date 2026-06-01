"use client";

import Link from "next/link";
import { ArrowRight, MapPin, MessageSquareWarning } from "lucide-react";
import { LandingReportCard } from "@/components/LandingReportCard";
import type { MeetupReport, Report } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";

const signalStyles = {
  green: "bg-emerald-500/20 text-emerald-400",
  yellow: "bg-yellow-500/20 text-yellow-400",
  orange: "bg-orange-500/20 text-orange-400",
  red: "bg-red-500/20 text-red-400",
};

export function RecentReportsFeed({
  reports,
  meetups = [],
}: {
  reports: Report[];
  meetups?: MeetupReport[];
}) {
  return (
    <section id="reports" className="scroll-mt-24" aria-label="Recent reports">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-heading text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-500">
            Fresh Intel
          </p>
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
            Recent Reports Near You
          </h2>
        </div>
        <Link
          href="/reports"
          className="group hidden shrink-0 items-center gap-1 text-sm font-semibold text-emerald-400 sm:inline-flex"
        >
          View all
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {reports.slice(0, 8).map((report, i) => (
          <LandingReportCard key={report.id} report={report} index={i} />
        ))}
        {meetups.slice(0, 3).map((meetup, i) => (
          <MeetupHighlightCard key={meetup.id} meetup={meetup} index={i + 8} />
        ))}
      </div>

      {reports.length === 0 && meetups.length === 0 && (
        <div className="glass-card p-8 text-center">
          <p className="text-sm text-zinc-500">No reports yet.</p>
        </div>
      )}

      <Link
        href="/reports"
        className="btn-secondary mt-4 flex w-full items-center justify-center gap-2 sm:hidden"
      >
        View all reports
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}

function MeetupHighlightCard({
  meetup,
  index,
}: {
  meetup: MeetupReport;
  index: number;
}) {
  return (
    <article
      className="glass-card w-[280px] shrink-0 overflow-hidden border-orange-500/20 sm:w-[300px]"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-center gap-2 border-b border-zinc-800/60 bg-orange-500/10 px-4 py-2.5">
        <MessageSquareWarning className="h-4 w-4 text-orange-400" />
        <span className="font-heading text-[10px] font-bold uppercase tracking-wider text-orange-400">
          Meetup Flag
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-base font-bold text-white">
              {meetup.seller_display_name}
            </h3>
            <p className="mt-0.5 text-sm text-zinc-400">{meetup.platform}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
              <MapPin className="h-3 w-3 shrink-0" />
              {meetup.city}, MI · {meetup.meetup_type}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold uppercase ${signalStyles[meetup.seller_signal]}`}
          >
            {meetup.seller_signal}
          </span>
        </div>
        {meetup.public_warning && (
          <p className="mt-3 line-clamp-2 text-xs text-orange-200/80">
            {meetup.public_warning}
          </p>
        )}
        <p className="mt-3 text-[11px] text-zinc-600">
          {formatTimeAgo(meetup.created_at)}
        </p>
      </div>
    </article>
  );
}
