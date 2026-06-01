"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SignUpButton } from "@clerk/nextjs";
import type { Preloaded } from "convex/react";
import { AppShell } from "@/components/AppShell";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { LandingPwaSection } from "@/components/LandingPwaSection";
import { MapViewDynamic } from "@/components/MapViewDynamic";
import { PageTransition } from "@/components/PageTransition";
import { SearchBar } from "@/components/SearchBar";
import { BoofTicker } from "@/components/home/BoofTicker";
import { HomepageHero } from "@/components/home/HomepageHero";
import { LiveScoreboard } from "@/components/home/LiveScoreboard";
import { TrendingNow } from "@/components/home/TrendingNow";
import { RecentReportsFeed } from "@/components/home/RecentReportsFeed";
import { AnalystCard } from "@/components/home/AnalystCard";
import { NotificationSettings } from "@/components/home/NotificationSettings";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/components/BoofAuthProvider";
import { MICHIGAN_CENTER } from "@/lib/constants";
import type { Report } from "@/lib/types";
import { usePreloadedReports } from "@/hooks/useRealtimeReports";
import { useMeetupReports } from "@/hooks/useMeetupReports";

export function HomeClient({
  preloadedReports,
  seedReports,
}: {
  preloadedReports: Preloaded<typeof api.reports.listApproved> | null;
  seedReports: Report[];
}) {
  if (preloadedReports) {
    return (
      <HomeClientLive
        preloadedReports={preloadedReports}
        seedReports={seedReports}
      />
    );
  }
  return <HomeClientView reports={seedReports} />;
}

function HomeClientLive({
  preloadedReports,
  seedReports,
}: {
  preloadedReports: Preloaded<typeof api.reports.listApproved>;
  seedReports: Report[];
}) {
  const reports = usePreloadedReports(preloadedReports, seedReports);
  return <HomeClientView reports={reports} />;
}

function HomeClientView({ reports }: { reports: Report[] }) {
  const { isAuthenticated } = useAuth();
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

  const scrollToMap = () => {
    document.getElementById("map")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToSettings = () => {
    document.getElementById("settings")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AppShell showFab variant="landing">
      <PageTransition>
        <BoofTicker />

        <div className="space-y-12 pb-8 pt-6 lg:space-y-16 lg:pb-12 lg:pt-8">
          <HomepageHero
            onOpenMap={scrollToMap}
            onOpenAlerts={scrollToSettings}
            reports={filtered}
            totalReports={reports.length}
          />

          <TrendingNow />

          <LiveScoreboard />

          <RecentReportsFeed reports={filtered} meetups={meetups} />

          <AnalystCard />

          <NotificationSettings />

          <HowItWorksSection />

          <section id="map" className="scroll-mt-24" aria-label="Map">
            <p className="section-kicker">Live Map</p>
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[var(--text-main)] sm:text-3xl">
              Tactical Intel Map
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Dispensary pins by signal tier · magenta diamonds = seller flags
            </p>

            <div className="mt-6">
              <SearchBar value={search} onChange={setSearch} />
            </div>

            <div className="mt-4 h-[50vh] min-h-[320px] overflow-hidden rounded-xl border border-[var(--border-soft)] lg:min-h-[480px]">
              <MapViewDynamic
                reports={filtered}
                meetups={meetups}
                center={[MICHIGAN_CENTER.lat, MICHIGAN_CENTER.lng]}
                zoom={8}
                className="h-full shadow-[0_12px_48px_rgba(0,0,0,0.5)]"
              />
            </div>
          </section>

          <LandingPwaSection />

          {!isAuthenticated && (
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              aria-label="Sign up"
              className="relative overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-8 lg:p-10"
            >
              <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="font-display text-xl font-extrabold uppercase tracking-tight text-[var(--text-main)] sm:text-2xl">
                    Join the intel network
                  </h3>
                  <p className="mt-2 max-w-lg text-sm text-[var(--text-muted)]">
                    Browse live signals free. Sign up to submit reports, confirm
                    alerts, and help Michigan skip the boof.
                  </p>
                </div>
                <SignUpButton mode="modal">
                  <button type="button" className="btn-primary shrink-0 px-8 py-4">
                    Create free account
                  </button>
                </SignUpButton>
              </div>
            </motion.section>
          )}
        </div>
      </PageTransition>
    </AppShell>
  );
}
