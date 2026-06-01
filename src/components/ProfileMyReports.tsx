"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { MapPin, Package } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { isConvexConfigured } from "@/lib/convex/config";
import type { MeetupReport, Report } from "@/lib/types";
import { formatTimeAgo } from "@/lib/utils";
import { getMarkerTier, tierStyles } from "@/lib/markers";

const statusLabel: Record<string, string> = {
  approved: "Live",
  pending: "Pending",
  flagged: "Under review",
  rejected: "Removed",
};

const statusStyle: Record<string, string> = {
  approved: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-amber-500/15 text-amber-400",
  flagged: "bg-amber-500/15 text-amber-400",
  rejected: "bg-red-500/15 text-red-400",
};

export function ProfileMyReports() {
  const configured = isConvexConfigured();
  const products = useQuery(
    api.reports.listMine,
    configured ? {} : "skip"
  );
  const meetups = useQuery(
    api.meetupReports.listMine,
    configured ? {} : "skip"
  );

  if (!configured) return null;
  if (products === undefined || meetups === undefined) {
    return (
      <div className="glass-card p-4">
        <p className="text-sm text-zinc-500">Loading your reports…</p>
      </div>
    );
  }

  const total = products.length + meetups.length;
  if (total === 0) {
    return (
      <section>
        <h3 className="section-kicker mb-3">Your reports</h3>
        <div className="glass-card p-5 text-center">
          <p className="text-sm text-zinc-500">You haven&apos;t submitted any reports yet.</p>
          <Link href="/report" className="btn-primary mt-4 inline-block px-5 py-2.5 text-sm">
            Submit a report
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h3 className="section-kicker">Your reports</h3>
        <Link href="/reports" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
          View feed →
        </Link>
      </div>
      <div className="space-y-2">
        {(products as Report[]).map((report) => {
          const tier = getMarkerTier(report);
          const tierStyle = tierStyles[tier];
          const status = report.status ?? "approved";
          return (
            <Link
              key={report.id}
              href="/reports"
              className="glass-card flex items-center gap-3 p-3.5 transition hover:border-zinc-700/70"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tierStyle.badge}`}
              >
                <Package className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-semibold text-white">
                  {report.strain_name}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {report.brand_name} · {report.city}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-600">
                  {formatTimeAgo(report.created_at)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyle[status] ?? statusStyle.approved}`}
              >
                {statusLabel[status] ?? status}
              </span>
            </Link>
          );
        })}
        {meetups.map((meetup) => {
          const status = meetup.status ?? "approved";
          return (
            <Link
              key={meetup.id}
              href="/reports?tab=meetup"
              className="glass-card flex items-center gap-3 border-fuchsia-500/15 p-3.5 transition hover:border-fuchsia-500/30"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/15 text-fuchsia-400">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-semibold text-white">
                  {meetup.seller_display_name}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  Meetup · {meetup.city}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-600">
                  {formatTimeAgo(meetup.created_at)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyle[status] ?? statusStyle.approved}`}
              >
                {statusLabel[status] ?? status}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
