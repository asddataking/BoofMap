"use client";

import { useMemo, useState } from "react";
import type { Preloaded } from "convex/react";
import { AppShell } from "@/components/AppShell";
import { MapViewDynamic } from "@/components/MapViewDynamic";
import { PageTransition } from "@/components/PageTransition";
import { SearchBar } from "@/components/SearchBar";
import { api } from "../../../convex/_generated/api";
import { MICHIGAN_CENTER } from "@/lib/constants";
import type { Report } from "@/lib/types";
import { usePreloadedReports } from "@/hooks/useRealtimeReports";
import { useMeetupReports } from "@/hooks/useMeetupReports";

export function MapPageClient({
  preloadedReports,
  seedReports,
}: {
  preloadedReports: Preloaded<typeof api.reports.listApproved> | null;
  seedReports: Report[];
}) {
  if (preloadedReports) {
    return (
      <MapPageLive
        preloadedReports={preloadedReports}
        seedReports={seedReports}
      />
    );
  }
  return <MapPageView reports={seedReports} />;
}

function MapPageLive({
  preloadedReports,
  seedReports,
}: {
  preloadedReports: Preloaded<typeof api.reports.listApproved>;
  seedReports: Report[];
}) {
  const reports = usePreloadedReports(preloadedReports, seedReports);
  return <MapPageView reports={reports} />;
}

function MapPageView({ reports }: { reports: Report[] }) {
  const meetups = useMeetupReports();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return reports;
    return reports.filter(
      (r) =>
        r.strain_name.toLowerCase().includes(q) ||
        r.brand_name.toLowerCase().includes(q) ||
        r.dispensary_name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q)
    );
  }, [reports, search]);

  const geoCount = filtered.filter((r) => r.latitude && r.longitude).length;

  return (
    <AppShell>
      <PageTransition>
        <div className="flex flex-col py-4 lg:py-6">
          <header className="shrink-0">
            <p className="section-kicker">Live Map</p>
            <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[var(--text-main)] sm:text-3xl">
              Tactical Intel Map
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {geoCount} mapped signals · dispensary pins by tier · magenta
              diamonds = seller flags
            </p>
            <div className="mt-4 max-w-xl">
              <SearchBar value={search} onChange={setSearch} />
            </div>
          </header>

          <div className="mt-4 min-h-[calc(100dvh-14rem)] flex-1 overflow-hidden rounded-xl border border-[var(--border-soft)] lg:min-h-[calc(100dvh-12rem)]">
            <MapViewDynamic
              reports={filtered}
              meetups={meetups}
              center={[MICHIGAN_CENTER.lat, MICHIGAN_CENTER.lng]}
              zoom={8}
              className="h-full min-h-[calc(100dvh-14rem)] shadow-[0_12px_48px_rgba(0,0,0,0.5)] lg:min-h-[calc(100dvh-12rem)]"
            />
          </div>
        </div>
      </PageTransition>
    </AppShell>
  );
}
