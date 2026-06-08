"use client";

import { motion } from "framer-motion";
import { SignUpButton } from "@clerk/nextjs";
import type { Preloaded } from "convex/react";
import { AppShell } from "@/components/AppShell";
import { FaqSection } from "@/components/FaqSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { LandingPwaSection } from "@/components/LandingPwaSection";
import { PageTransition } from "@/components/PageTransition";
import { DetectionTicker } from "@/components/intelligence/DetectionTicker";
import { IntelligenceErrorBoundary } from "@/components/intelligence/IntelligenceErrorBoundary";
import { IntelligenceHero } from "@/components/home/IntelligenceHero";
import { TopFlowerSection } from "@/components/home/TopFlowerSection";
import { ForecastPulseSection } from "@/components/forecast/ForecastPulseSection";
import { IntelligenceScoreboard } from "@/components/home/IntelligenceScoreboard";
import { CommunityFeedSection } from "@/components/home/CommunityFeedSection";
import { MapSection } from "@/components/home/MapSection";
import { AnalystRankTeaser } from "@/components/home/AnalystRankTeaser";
import { GAMIFICATION_ENABLED } from "@/lib/intelligence/featureFlags";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@/components/BoofAuthProvider";
import type { MeetupReport, Report } from "@/lib/types";
import { usePreloadedMeetupReports } from "@/hooks/useRealtimeMeetupReports";
import { usePreloadedReports } from "@/hooks/useRealtimeReports";
import { isConvexConfigured } from "@/lib/convex/config";
import { useQuery } from "convex/react";
import { mergeMeetupFeed } from "@/lib/data/mergeMeetupFeed";
import { resolveFeedList } from "@/lib/data/resolveFeed";

export function HomeClient({
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
      <HomeClientLive
        preloadedReports={preloadedReports}
        preloadedMeetupReports={preloadedMeetupReports}
        seedReports={seedReports}
        seedMeetupReports={seedMeetupReports}
      />
    );
  }
  if (isConvexConfigured()) {
    return (
      <HomeClientQuery
        seedReports={seedReports}
        seedMeetupReports={seedMeetupReports}
      />
    );
  }
  return (
    <HomeClientView
      reports={seedReports}
      meetups={seedMeetupReports}
    />
  );
}

function HomeClientQuery({
  seedReports,
  seedMeetupReports,
}: {
  seedReports: Report[];
  seedMeetupReports: MeetupReport[];
}) {
  const { isAuthenticated } = useAuth();
  const liveReports = useQuery(api.reports.listApproved, {}) as
    | Report[]
    | undefined;
  const approved = useQuery(api.meetupReports.listApproved, {}) as
    | MeetupReport[]
    | undefined;
  const mine = useQuery(
    api.meetupReports.listMine,
    isAuthenticated ? {} : "skip"
  );
  const reports = resolveFeedList(liveReports, seedReports);
  const meetups = resolveFeedList(
    mergeMeetupFeed(approved, mine as MeetupReport[] | undefined),
    seedMeetupReports
  );

  return <HomeClientView reports={reports} meetups={meetups} />;
}

function HomeClientLive({
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
  const meetups = usePreloadedMeetupReports(
    preloadedMeetupReports,
    seedMeetupReports
  );
  return <HomeClientView reports={reports} meetups={meetups} />;
}

function HomeClientView({
  reports,
  meetups,
}: {
  reports: Report[];
  meetups: MeetupReport[];
}) {
  const { isAuthenticated } = useAuth();

  return (
    <AppShell showFab variant="landing">
      <PageTransition>
        <IntelligenceErrorBoundary>
          <DetectionTicker />
        </IntelligenceErrorBoundary>

        <div className="space-y-12 pb-8 pt-4 lg:space-y-16 lg:pb-12 lg:pt-6">
          <IntelligenceErrorBoundary>
            <IntelligenceHero />
          </IntelligenceErrorBoundary>

          <IntelligenceErrorBoundary>
            <TopFlowerSection />
          </IntelligenceErrorBoundary>

          <IntelligenceErrorBoundary>
            <ForecastPulseSection />
          </IntelligenceErrorBoundary>

          <IntelligenceErrorBoundary>
            <IntelligenceScoreboard />
          </IntelligenceErrorBoundary>

          <IntelligenceErrorBoundary>
            <CommunityFeedSection reports={reports} meetups={meetups} />
          </IntelligenceErrorBoundary>

          <IntelligenceErrorBoundary>
            <MapSection reports={reports} meetups={meetups} />
          </IntelligenceErrorBoundary>

          <HowItWorksSection />

          <FaqSection id="home-faq" heading="Common questions" />

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
                    Join the intelligence network
                  </h3>
                  <p className="mt-2 max-w-lg text-sm text-[var(--text-muted)]">
                    Browse live reports free. Sign up to submit intelligence,
                    confirm alerts, and earn status in the cannabis intelligence
                    network.
                  </p>
                  {GAMIFICATION_ENABLED && <AnalystRankTeaser />}
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
