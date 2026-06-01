"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, MapPin, QrCode, Zap } from "lucide-react";
import { PhoneMapMockup } from "@/components/PhoneMapMockup";
import type { Report } from "@/lib/types";
import { getMarkerTier } from "@/lib/markers";

export function HomepageHero({
  onOpenMap,
  onOpenAlerts,
  reports,
  totalReports,
}: {
  onOpenMap: () => void;
  onOpenAlerts: () => void;
  reports: Report[];
  totalReports: number;
}) {
  const mapStats = {
    boofReports: reports.filter((r) => getMarkerTier(r) === "boof").length,
    taxedAlerts: reports.filter((r) => getMarkerTier(r) === "taxed").length,
    fireFinds: reports.filter((r) => getMarkerTier(r) === "fire").length,
    midProducts: reports.filter((r) => getMarkerTier(r) === "mid").length,
  };

  return (
    <section className="relative overflow-hidden pt-4 lg:pt-8" aria-label="Welcome">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-12 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-6 lg:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
              <span className="font-heading text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">
                Michigan · Live
              </span>
            </div>
            <h1 className="font-heading text-[2.25rem] font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              America&apos;s Live
              <br />
              <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                Weed Scoreboard
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg">
              Real-time boof alerts, fire finds, and dispensary intel — scored
              by the community, not the brands.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3"
          >
            <Link
              href="/report"
              className="btn-primary col-span-2 inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:col-span-1"
            >
              <Zap className="h-4 w-4" />
              Report Boof
            </Link>
            <Link
              href="#"
              onClick={(e) => e.preventDefault()}
              className="btn-dark inline-flex items-center justify-center gap-2 px-4 py-3.5 text-sm"
              title="METRC tag scanning coming soon"
            >
              <QrCode className="h-4 w-4" />
              Scan METRC Tag
            </Link>
            <button
              type="button"
              onClick={onOpenAlerts}
              className="btn-dark inline-flex items-center justify-center gap-2 px-4 py-3.5 text-sm"
            >
              <Bell className="h-4 w-4" />
              Boof Alerts
            </button>
            <button
              type="button"
              onClick={onOpenMap}
              className="btn-secondary col-span-2 inline-flex items-center justify-center gap-2 sm:col-span-1"
            >
              <MapPin className="h-4 w-4" />
              Open Map
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center gap-4 border-t border-zinc-800/80 pt-5"
          >
            <ScoreboardStat label="Reports" value={totalReports} />
            <ScoreboardStat label="Fire" value={mapStats.fireFinds} accent="emerald" />
            <ScoreboardStat label="Boof" value={mapStats.boofReports} accent="red" />
            <ScoreboardStat label="Taxed" value={mapStats.taxedAlerts} accent="orange" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex justify-center lg:justify-end"
        >
          <PhoneMapMockup reports={reports} stats={mapStats} />
        </motion.div>
      </div>
    </section>
  );
}

function ScoreboardStat({
  label,
  value,
  accent = "default",
}: {
  label: string;
  value: number;
  accent?: "default" | "emerald" | "red" | "orange";
}) {
  const colors = {
    default: "text-white",
    emerald: "text-emerald-400",
    red: "text-red-400",
    orange: "text-orange-400",
  };
  return (
    <div className="min-w-[72px]">
      <p className={`font-heading text-2xl font-bold tabular-nums ${colors[accent]}`}>
        {value.toLocaleString()}
      </p>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
    </div>
  );
}
