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
import {
  FEED_FILTERS,
  MEETUP_FEED_FILTERS,
  MICHIGAN_CENTER,
  normalizeFeedFilter,
} from "@/lib/constants";
import { filterReports } from "@/lib/data/reports";
import { filterMeetupReports } from "@/lib/data/meetupReports";
import { getMarkerTier } from "@/lib/markers";
import type { MeetupReport, Report } from "@/lib/types";
import { cn } from "@/lib/utils";
import { usePreloadedMeetupReports } from "@/hooks/useRealtimeMeetupReports";
import { usePreloadedReports } from "@/hooks/useRealtimeReports";
import { isConvexConfigured } from "@/lib/convex/config";

export function ReportsClient({
  preloadedReports,
  preloadedMeetupReports,
  seedReports,
  seedMeetupReports,
}: {
  preloadedReports: Preloaded<typeof api.reports.listApproved> | null;
  preloadedMeetupReports: Preloaded<
    typeof api.meetupReports.listApproved
  > | null;
  seedReports: Report[];
  seedMeetupReports: MeetupReport[];
}) {
  if (preloadedReports && preloadedMeetupReports) {
    return (
      <ReportsClientLive
        preloadedReports={preloadedReports}
        preloadedMeetupReports={preloadedMeetupReports}
        seedReports={seedReports}
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
  preloadedMeetupReports,
  seedReports,
  seedMeetupReports,
}: {
  preloadedReports: Preloaded<typeof api.reports.listApproved>;
  preloadedMeetupReports: Preloaded<typeof api.meetupReports.listApproved>;
  seedReports: Report[];
  seedMeetupReports: MeetupReport[];
}) {
  const reports = usePreloadedReports(preloadedReports, seedReports);
  const meetupReports = usePreloadedMeetupReports(
    preloadedMeetupReports,
    seedMeetupReports
  );
  const { isAuthenticated } = useAuth();
  const voteMutation = useMutation(api.reports.vote);
  const confirmMeetupMutation = useMutation(api.meetupReports.confirm);

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
    <ReportsClientView
      reports={reports}
      meetupReports={meetupReports}
      onVoteProduct={voteProduct}
      onConfirmMeetup={confirmMeetup}
    />
  );
}

function ReportsClientView({
  reports,
  meetupReports,
  onVoteProduct,
  onConfirmMeetup,
}: {
  reports: Report[];
  meetupReports: MeetupReport[];
  onVoteProduct?: (reportId: string, voteType: "confirm" | "downvote") => void;
  onConfirmMeetup?: (reportId: string) => void;
}) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [feedTab, setFeedTab] = useState<"product" | "meetup">(
    tabParam === "meetup" ? "meetup" : "product"
  );

  const [activeFilter, setActiveFilter] = useState("latest");
  const [search, setSearch] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    if (tabParam === "meetup") setFeedTab("meetup");
  }, [tabParam]);

  useEffect(() => {
    setActiveFilter((current) => normalizeFeedFilter(feedTab, current));
  }, [feedTab]);

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

  const searchFilteredMeetups = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return meetupReports;
    return meetupReports.filter(
      (r) =>
        r.seller_display_name.toLowerCase().includes(q) ||
        r.platform.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        (r.area?.toLowerCase().includes(q) ?? false) ||
        (r.notes?.toLowerCase().includes(q) ?? false) ||
        r.issue_tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [meetupReports, search]);

  const productFilter = normalizeFeedFilter("product", activeFilter);

  const filteredProduct = useMemo(
    () =>
      filterReports(searchFiltered, productFilter, coords?.lat, coords?.lng),
    [searchFiltered, productFilter, coords]
  );

  const meetupFilter = normalizeFeedFilter("meetup", activeFilter);

  const filteredMeetup = useMemo(
    () =>
      filterMeetupReports(
        searchFilteredMeetups,
        meetupFilter,
        coords?.lat,
        coords?.lng
      ),
    [searchFilteredMeetups, meetupFilter, coords]
  );

  const stats = useMemo(() => {
    if (feedTab === "meetup") {
      const mapped = searchFilteredMeetups.filter(
        (r) => r.latitude != null && r.longitude != null
      ).length;
      return {
        total: searchFilteredMeetups.length,
        fire: 0,
        boof: 0,
        mapped,
      };
    }
    const fire = searchFiltered.filter((r) => getMarkerTier(r) === "fire").length;
    const boof = searchFiltered.filter((r) => getMarkerTier(r) === "boof").length;
    const mapped = searchFiltered.filter(
      (r) => r.latitude != null && r.longitude != null
    ).length;
    const meetupMapped = searchFilteredMeetups.filter(
      (r) => r.latitude != null && r.longitude != null
    ).length;
    return {
      total: searchFiltered.length,
      fire,
      boof,
      mapped: mapped + meetupMapped,
    };
  }, [searchFiltered, searchFilteredMeetups, feedTab]);

  const filters =
    feedTab === "product" ? FEED_FILTERS : MEETUP_FEED_FILTERS;

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
            <StatPill
              label={feedTab === "meetup" ? "Seller reports" : "Signals"}
              value={stats.total}
            />
            {feedTab === "product" ? (
              <>
                <StatPill label="Fire finds" value={stats.fire} accent="fire" />
                <StatPill label="Boof alerts" value={stats.boof} accent="boof" />
              </>
            ) : (
              <>
                <StatPill
                  label="Meetup pins"
                  value={searchFilteredMeetups.filter(
                    (r) => r.latitude != null && r.longitude != null
                  ).length}
                  accent="fire"
                />
                <StatPill
                  label="Dispensary signals"
                  value={searchFiltered.length}
                />
              </>
            )}
            <StatPill label="On map" value={stats.mapped} />
          </div>

          <div className="mt-4 max-w-xl">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder={
                feedTab === "meetup"
                  ? "Search seller, platform, city, tags, notes…"
                  : "Search strain, brand, dispo, city, notes…"
              }
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
                  meetups={searchFilteredMeetups}
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
                    onClick={() => {
                      setFeedTab(t);
                      setActiveFilter("latest");
                    }}
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
                    {t === "meetup" && meetupReports.length > 0 && (
                      <span className="ml-1.5 rounded-full bg-fuchsia-500/25 px-1.5 py-0.5 text-[10px] tabular-nums">
                        {meetupReports.length}
                      </span>
                    )}
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
                      onConfirm={() => onVoteProduct?.(report.id, "confirm")}
                      onDownvote={() => onVoteProduct?.(report.id, "downvote")}
                    />
                  ))}
                {feedTab === "meetup" &&
                  filteredMeetup.map((report, i) => (
                    <MeetupReportCard
                      key={report.id}
                      report={report}
                      index={i}
                      onConfirm={() => onConfirmMeetup?.(report.id)}
                    />
                  ))}
                {((feedTab === "product" && filteredProduct.length === 0) ||
                  (feedTab === "meetup" && filteredMeetup.length === 0)) && (
                  <p className="py-12 text-center text-sm text-[var(--text-muted)]">
                    {feedTab === "meetup" && meetupReports.length > 0
                      ? "No meetup reports match this filter. Try Latest or clear search."
                      : feedTab === "meetup"
                        ? "No meetup or seller reports yet. Be the first to flag a bad experience."
                        : "No signals match this filter."}
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
