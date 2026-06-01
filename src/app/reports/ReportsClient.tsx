"use client";

import { useEffect, useMemo, useState } from "react";
import type { Preloaded } from "convex/react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AnalyticalReportCard } from "@/components/AnalyticalReportCard";
import { MapViewDynamic } from "@/components/MapViewDynamic";
import { MeetupReportCard } from "@/components/MeetupReportCard";
import { PageTransition } from "@/components/PageTransition";
import { SearchBar } from "@/components/SearchBar";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "@/components/BoofAuthProvider";
import { FEED_FILTERS, MEETUP_FEED_FILTERS, MICHIGAN_CENTER } from "@/lib/constants";
import { filterReports } from "@/lib/data/reports";
import { filterMeetupReports } from "@/lib/data/meetupReports";
import { isConvexConfigured } from "@/lib/convex/config";
import { getMarkerTier } from "@/lib/markers";
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
  const [search, setSearch] = useState("");
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

  const searchFiltered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return reports;
    return reports.filter(
      (r) =>
        r.strain_name.toLowerCase().includes(q) ||
        r.brand_name.toLowerCase().includes(q) ||
        r.dispensary_name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        (r.notes?.toLowerCase().includes(q) ?? false)
    );
  }, [reports, search]);

  const filteredProduct = useMemo(
    () =>
      filterReports(searchFiltered, activeFilter, coords?.lat, coords?.lng),
    [searchFiltered, activeFilter, coords]
  );

  const filteredMeetup = useMemo(
    () =>
      filterMeetupReports(meetupReports, activeFilter, coords?.lat, coords?.lng),
    [meetupReports, activeFilter, coords]
  );

  const stats = useMemo(() => {
    const fire = searchFiltered.filter((r) => getMarkerTier(r) === "fire").length;
    const boof = searchFiltered.filter((r) => getMarkerTier(r) === "boof").length;
    const mapped = searchFiltered.filter(
      (r) => r.latitude != null && r.longitude != null
    ).length;
    return { total: searchFiltered.length, fire, boof, mapped };
  }, [searchFiltered]);

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
        <div className="py-4 lg:py-6">
          <header>
            <p className="section-kicker">Intel Hub</p>
            <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[var(--text-main)] sm:text-3xl">
              Map &amp; Reports
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
              Tactical map plus analytical community signals — what was reported,
              where, and how the crowd scored it.
            </p>
          </header>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <StatPill label="Signals" value={stats.total} />
            <StatPill label="Fire finds" value={stats.fire} accent="fire" />
            <StatPill label="Boof alerts" value={stats.boof} accent="boof" />
            <StatPill label="On map" value={stats.mapped} />
          </div>

          <div className="mt-4 max-w-xl">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search strain, brand, dispo, city, notes…"
            />
          </div>

          <div className="mt-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
            <section
              aria-label="Tactical map"
              className="overflow-hidden rounded-xl border border-[var(--border-soft)] lg:sticky lg:top-24"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-soft)] bg-[var(--bg-card)] px-3 py-2.5">
                <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-[#39FF88]">
                  Live map
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  {stats.mapped} pins
                </span>
              </div>
              <div className="h-[42vh] min-h-[280px] lg:h-[calc(100vh-12rem)] lg:min-h-[520px]">
                <MapViewDynamic
                  reports={searchFiltered}
                  meetups={meetupReports}
                  center={[MICHIGAN_CENTER.lat, MICHIGAN_CENTER.lng]}
                  zoom={8}
                  className="h-full"
                />
              </div>
            </section>

            <section aria-label="Report feed" className="min-w-0">
              <div className="flex rounded-xl border border-[var(--border-soft)] bg-[var(--bg-panel)] p-1">
                {(["product", "meetup"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFeedTab(t)}
                    className={cn(
                      "flex-1 rounded-lg py-2 font-display text-xs font-bold uppercase tracking-wide transition",
                      feedTab === t
                        ? t === "product"
                          ? "bg-[#39FF88]/15 text-[#39FF88]"
                          : "bg-fuchsia-500/15 text-fuchsia-300"
                        : "text-[var(--text-muted)]"
                    )}
                  >
                    {t === "product" ? "Dispensary" : "Meetup / Seller"}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {filters.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id)}
                    className={cn(
                      "shrink-0 rounded-lg border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-wide transition",
                      activeFilter === f.id
                        ? feedTab === "product"
                          ? "border-[#39FF88]/40 bg-[#39FF88]/12 text-[#39FF88]"
                          : "border-fuchsia-500/40 bg-fuchsia-500/12 text-fuchsia-300"
                        : "border-[var(--border-soft)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                {feedTab === "product" &&
                  filteredProduct.map((report, i) => (
                    <AnalyticalReportCard
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
                  <p className="py-12 text-center text-sm text-[var(--text-muted)]">
                    No signals match this filter.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </PageTransition>
    </AppShell>
  );
}

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "fire" | "boof";
}) {
  const valueColor =
    accent === "fire"
      ? "text-[#39FF88]"
      : accent === "boof"
        ? "text-[#FF3B3B]"
        : "text-[var(--text-main)]";

  return (
    <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] px-3 py-2.5">
      <p className="font-display text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </p>
      <p className={cn("font-display text-xl font-black tabular-nums", valueColor)}>
        {value}
      </p>
    </div>
  );
}
