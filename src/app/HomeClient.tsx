"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SignUpButton } from "@clerk/nextjs";
import type { Preloaded } from "convex/react";
import {
  AlertTriangle,
  Crown,
  DollarSign,
  Leaf,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { LandingStatCard } from "@/components/LandingStatCard";
import { LandingPwaSection } from "@/components/LandingPwaSection";
import { MapViewDynamic } from "@/components/MapViewDynamic";
import { PageTransition } from "@/components/PageTransition";
import { SearchBar } from "@/components/SearchBar";
import { BoofTicker } from "@/components/home/BoofTicker";
import { HomepageHero } from "@/components/home/HomepageHero";
import { LiveScoreboard } from "@/components/home/LiveScoreboard";
import { MarketMovers } from "@/components/home/MarketMovers";
import { RecentReportsFeed } from "@/components/home/RecentReportsFeed";
import { AnalystCard } from "@/components/home/AnalystCard";
import { NotificationSettings } from "@/components/home/NotificationSettings";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/components/BoofAuthProvider";
import { MICHIGAN_CENTER } from "@/lib/constants";
import type { Report } from "@/lib/types";
import { usePreloadedReports } from "@/hooks/useRealtimeReports";
import { useMeetupReports } from "@/hooks/useMeetupReports";
import { getMarkerTier } from "@/lib/markers";

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

function countThisWeek(reports: Report[], predicate: (r: Report) => boolean) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return reports.filter(
    (r) => predicate(r) && new Date(r.created_at).getTime() >= weekAgo
  ).length;
}

function HomeClientView({ reports }: { reports: Report[] }) {
  const { isAuthenticated } = useAuth();
  const meetups = useMeetupReports();
  const [search, setSearch] = useState("");

  const stats = useMemo(() => {
    const brands = new Set(reports.map((r) => r.brand_name));
    const dispos = new Set(reports.map((r) => r.dispensary_name));
    const taxed = reports.filter((r) => getMarkerTier(r) === "taxed");
    const boof = reports.filter((r) => getMarkerTier(r) === "boof");
    return {
      boofReports: boof.length,
      disposRated: dispos.size,
      brandsReviewed: brands.size,
      taxedAlerts: taxed.length,
      boofThisWeek: countThisWeek(reports, (r) => getMarkerTier(r) === "boof"),
      disposThisWeek: countThisWeek(reports, () => true),
      brandsThisWeek: countThisWeek(reports, () => true),
      taxedThisWeek: countThisWeek(reports, (r) => getMarkerTier(r) === "taxed"),
    };
  }, [reports]);

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

        <div className="space-y-16 pb-8 pt-6 lg:space-y-24 lg:pb-12 lg:pt-8">
          <HomepageHero
            onOpenMap={scrollToMap}
            onOpenAlerts={scrollToSettings}
            reports={filtered}
            totalReports={reports.length}
          />

          <LiveScoreboard />

          <section aria-label="Statistics">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin lg:grid lg:grid-cols-4 lg:overflow-visible">
              <LandingStatCard
                label="Boof Reports"
                value={stats.boofReports}
                delta={`+${stats.boofThisWeek} this week`}
                icon={Leaf}
                accent="emerald"
                index={0}
              />
              <LandingStatCard
                label="Dispensaries Rated"
                value={stats.disposRated}
                delta={`+${Math.min(stats.disposThisWeek, stats.disposRated)} this week`}
                icon={DollarSign}
                accent="orange"
                index={1}
              />
              <LandingStatCard
                label="Brands Reviewed"
                value={stats.brandsReviewed}
                delta={`+${Math.min(stats.brandsThisWeek, stats.brandsReviewed)} this week`}
                icon={Crown}
                accent="purple"
                index={2}
              />
              <LandingStatCard
                label="Taxed Alerts"
                value={stats.taxedAlerts}
                delta={`+${stats.taxedThisWeek} this week`}
                icon={AlertTriangle}
                accent="red"
                index={3}
              />
            </div>
          </section>

          <RecentReportsFeed reports={filtered} meetups={meetups} />

          <MarketMovers />

          <AnalystCard />

          <NotificationSettings />

          <HowItWorksSection />

          <section id="map" className="scroll-mt-24" aria-label="Map">
            <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
              Explore Michigan
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Search and browse geo-tagged community reports.
            </p>

            <div className="mt-6">
              <SearchBar value={search} onChange={setSearch} />
            </div>

            <div className="mt-4 h-[50vh] min-h-[320px] overflow-hidden rounded-2xl border border-zinc-800/60 lg:min-h-[480px]">
              <MapViewDynamic
                reports={filtered}
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
              className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-8 lg:p-10"
            >
              <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="font-heading text-xl font-bold text-white sm:text-2xl">
                    Join the community
                  </h3>
                  <p className="mt-2 max-w-lg text-sm text-zinc-500">
                    Browse free forever. Sign up to submit reports, confirm
                    findings, and help Michigan avoid boof.
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
