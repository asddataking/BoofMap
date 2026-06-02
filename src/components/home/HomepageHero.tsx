"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, MapPin, Shield, Skull, Zap } from "lucide-react";
import { LandingStatCard } from "@/components/LandingStatCard";
import { TacticalMapPanel } from "@/components/home/TacticalMapPanel";
import type { MeetupReport, Report } from "@/lib/types";
import { getMarkerTier } from "@/lib/markers";

function countSince(reports: Report[], ms: number, predicate: (r: Report) => boolean) {
  const since = Date.now() - ms;
  return reports.filter(
    (r) => predicate(r) && new Date(r.created_at).getTime() >= since
  ).length;
}

export function HomepageHero({
  reports,
  meetups = [],
  totalReports,
}: {
  reports: Report[];
  meetups?: MeetupReport[];
  totalReports: number;
}) {
  const fireFinds = reports.filter((r) => getMarkerTier(r) === "fire").length;
  const boofAlerts = reports.filter((r) => getMarkerTier(r) === "boof").length;
  const fireToday = countSince(reports, 24 * 60 * 60 * 1000, (r) => getMarkerTier(r) === "fire");
  const boofToday = countSince(reports, 24 * 60 * 60 * 1000, (r) => getMarkerTier(r) === "boof");
  const reportsToday = countSince(reports, 24 * 60 * 60 * 1000, () => true);
  const trustScore = Math.min(
    99,
    Math.round(
      reports.length
        ? (reports.reduce((s, r) => s + (r.confirm_count ?? 0), 0) /
            Math.max(reports.length, 1)) *
            12
        : 72
    )
  );

  return (
    <section className="relative overflow-hidden pt-2 lg:pt-4" aria-label="Welcome">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#39FF88]/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-12 h-96 w-96 rounded-full bg-[#FF3B3B]/5 blur-3xl" />

      <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-stretch lg:gap-10">
        <div className="flex flex-col gap-6 lg:gap-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-[#39FF88]/30 bg-[#39FF88]/8 px-3 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39FF88] opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#39FF88]" />
              </span>
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[#39FF88]">
                Community-Powered Cannabis Transparency
              </span>
            </div>

            <h1 className="font-display font-black uppercase leading-[0.92] tracking-tight">
              <span className="block text-[clamp(2.75rem,10vw,4.5rem)] text-[#39FF88] drop-shadow-[0_0_32px_rgba(57,255,136,0.35)]">
                Find Fire.
              </span>
              <span className="mt-1 block text-[clamp(2.75rem,10vw,4.5rem)] text-[#FF3B3B] drop-shadow-[0_0_28px_rgba(255,59,59,0.3)]">
                Avoid Boof.
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-[var(--text-muted)]">
              Real cannabis reports from real consumers. Track quality, value,
              flavor, effects, and trust across legal markets — not pay-to-play
              menus.
            </p>
            <p className="mt-2 text-sm text-[var(--text-muted)]/80">
              The cannabis transparency platform for legal markets. Community
              intelligence nationwide — launching in Michigan — updated
              continuously.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              href="/report"
              className="btn-primary inline-flex flex-1 items-center justify-center gap-2 px-6 py-3.5 sm:flex-none"
            >
              <Zap className="h-4 w-4" aria-hidden />
              Report Boof
            </Link>
            <Link
              href="/reports"
              className="btn-secondary inline-flex flex-1 items-center justify-center gap-2 px-6 py-3.5 sm:flex-none"
            >
              <MapPin className="h-4 w-4" aria-hidden />
              Open Map
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin lg:grid lg:grid-cols-2 lg:overflow-visible xl:grid-cols-4"
          >
            <LandingStatCard
              label="Fire Finds"
              value={fireFinds}
              delta={`+${fireToday} today`}
              icon={Flame}
              accent="fire"
              index={0}
            />
            <LandingStatCard
              label="Boof Alerts"
              value={boofAlerts}
              delta={`+${boofToday} today`}
              icon={Skull}
              accent="boof"
              index={1}
            />
            <LandingStatCard
              label="Live Reports"
              value={totalReports}
              delta={`+${reportsToday} today`}
              icon={Shield}
              accent="intel"
              index={2}
            />
            <LandingStatCard
              label="Community Trust"
              value={`${trustScore}%`}
              delta="Signals verified"
              icon={Zap}
              accent="trust"
              index={3}
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="min-h-[320px] lg:min-h-full"
        >
          <TacticalMapPanel reports={reports} meetups={meetups} />
        </motion.div>
      </div>
    </section>
  );
}
