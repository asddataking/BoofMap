"use client";

import { useEffect, useMemo, useState } from "react";
import type { Preloaded } from "convex/react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PageTransition } from "@/components/PageTransition";
import { ReportCard } from "@/components/ReportCard";
import { MeetupReportCard } from "@/components/MeetupReportCard";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "@/components/BoofAuthProvider";
import { FEED_FILTERS, MEETUP_FEED_FILTERS } from "@/lib/constants";
import { filterReports } from "@/lib/data/reports";
import { filterMeetupReports } from "@/lib/data/meetupReports";
import { isConvexConfigured } from "@/lib/convex/config";
import type { MeetupReport, Report } from "@/lib/types";
import { cn } from "@/lib/utils";
import { usePreloadedReports } from "@/hooks/useRealtimeReports";
import { usePreloadedMeetupReports } from "@/hooks/useRealtimeMeetupReports";

export function ReportsClient({
  preloadedReports,
  seedReports,
  preloadedMeetupReports,
  seedMeetupReports,
}: {
  preloadedReports: Preloaded<typeof api.reports.listApproved> | null;
  seedReports: Report[];
  preloadedMeetupReports: Preloaded<typeof api.meetupReports.listApproved> | null;
  seedMeetupReports: MeetupReport[];
}) {
  if (preloadedReports && preloadedMeetupReports) {
    return (
      <ReportsClientLive
        preloadedReports={preloadedReports}
        seedReports={seedReports}
        preloadedMeetupReports={preloadedMeetupReports}
        seedMeetupReports={seedMeetupReports}
      />
    );
  }
  return (
    <ReportsClientView
      reports={seedReports}
      meetupReports={seedMeetupReports}
    />
  );
}

function ReportsClientLive({
  preloadedReports,
  seedReports,
  preloadedMeetupReports,
  seedMeetupReports,
}: {
  preloadedReports: Preloaded<typeof api.reports.listApproved>;
  seedReports: Report[];
  preloadedMeetupReports: Preloaded<typeof api.meetupReports.listApproved>;
  seedMeetupReports: MeetupReport[];
}) {
  const reports = usePreloadedReports(preloadedReports, seedReports);
  const meetupReports = usePreloadedMeetupReports(
    preloadedMeetupReports,
    seedMeetupReports
  );
  return (
    <ReportsClientView reports={reports} meetupReports={meetupReports} />
  );
}

function ReportsClientView({
  reports,
  meetupReports,
}: {
  reports: Report[];
  meetupReports: MeetupReport[];
}) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [feedTab, setFeedTab] = useState<"product" | "meetup">(
    tabParam === "meetup" ? "meetup" : "product"
  );

  const { isAuthenticated } = useAuth();
  const voteMutation = useMutation(api.reports.vote);
  const confirmMeetupMutation = useMutation(api.meetupReports.confirm);

  const [activeFilter, setActiveFilter] = useState("latest");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    if (tabParam === "meetup") setFeedTab("meetup");
  }, [tabParam]);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => setCoords({ lat: 42.3314, lng: -83.0458 })
      );
    } else {
      setCoords({ lat: 42.3314, lng: -83.0458 });
    }
  }, []);

  const filteredProduct = useMemo(
    () =>
      filterReports(reports, activeFilter, coords?.lat, coords?.lng),
    [reports, activeFilter, coords]
  );

  const filteredMeetup = useMemo(
    () =>
      filterMeetupReports(meetupReports, activeFilter, coords?.lat, coords?.lng),
    [meetupReports, activeFilter, coords]
  );

  const filters =
    feedTab === "product" ? FEED_FILTERS : MEETUP_FEED_FILTERS;

  const voteProduct = async (
    reportId: string,
    voteType: "confirm" | "downvote"
  ) => {
    if (!isAuthenticated || !isConvexConfigured()) return;
    await voteMutation({
      reportId: reportId as Id<"reports">,
      voteType,
    });
  };

  const confirmMeetup = async (reportId: string) => {
    if (!isAuthenticated || !isConvexConfigured()) return;
    await confirmMeetupMutation({
      reportId: reportId as Id<"meetupReports">,
    });
  };

  return (
    <AppShell showFab>
      <PageTransition>
        <div className="py-4 lg:py-8">
          <p className="section-kicker">Intel Feed</p>
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
            Live reports
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Community submissions — sorted by latest by default.
          </p>

          <div className="mt-4 flex rounded-2xl border border-zinc-800 bg-zinc-900/50 p-1">
            {(["product", "meetup"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFeedTab(t)}
                className={cn(
                  "flex-1 rounded-xl py-2 text-sm font-medium transition",
                  feedTab === t
                    ? t === "product"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-fuchsia-500/20 text-fuchsia-300"
                    : "text-zinc-500"
                )}
              >
                {t === "product" ? "Dispensary" : "Meetup / Seller"}
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                  activeFilter === f.id
                    ? feedTab === "product"
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                      : "border-fuchsia-500/50 bg-fuchsia-500/15 text-fuchsia-300"
                    : "border-zinc-800 text-zinc-500 hover:border-zinc-700"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-4">
            {feedTab === "product" &&
              filteredProduct.map((report, i) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  index={i}
                  onConfirm={() => voteProduct(report.id, "confirm")}
                  onDownvote={() => voteProduct(report.id, "downvote")}
                />
              ))}
            {feedTab === "meetup" &&
              filteredMeetup.map((report, i) => (
                <MeetupReportCard
                  key={report.id}
                  report={report}
                  index={i}
                  onConfirm={() => confirmMeetup(report.id)}
                />
              ))}
            {((feedTab === "product" && filteredProduct.length === 0) ||
              (feedTab === "meetup" && filteredMeetup.length === 0)) && (
              <p className="py-12 text-center text-sm text-zinc-600">
                No reports match this filter.
              </p>
            )}
          </div>
        </div>
      </PageTransition>
    </AppShell>
  );
}
