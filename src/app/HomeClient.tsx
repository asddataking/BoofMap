"use client";

import { motion } from "framer-motion";
import { SignUpButton } from "@clerk/nextjs";
import type { Preloaded } from "convex/react";
import { AppShell } from "@/components/AppShell";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { LandingPwaSection } from "@/components/LandingPwaSection";
import { PageTransition } from "@/components/PageTransition";
import { BoofTicker } from "@/components/home/BoofTicker";
import { HomepageHero } from "@/components/home/HomepageHero";
import { IntelBoard } from "@/components/home/IntelBoard";
import { AnalystRankTeaser } from "@/components/home/AnalystRankTeaser";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/components/BoofAuthProvider";
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

  return (
    <AppShell showFab variant="landing">
      <PageTransition>
        <BoofTicker />

        <div className="space-y-12 pb-8 pt-4 lg:space-y-16 lg:pb-12 lg:pt-6">
          <HomepageHero
            reports={reports}
            meetups={meetups}
            totalReports={reports.length}
          />

          <IntelBoard reports={reports} meetups={meetups} />

          <HowItWorksSection />

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
                  <AnalystRankTeaser />
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
