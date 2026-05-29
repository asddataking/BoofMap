"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Zap } from "lucide-react";
import { PhoneMapMockup } from "./PhoneMapMockup";
import type { Report } from "@/lib/types";
import { getMarkerTier } from "@/lib/markers";

export function LandingHero({
  onOpenMap,
  reports,
  totalReports,
}: {
  onOpenMap: () => void;
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
    <section className="relative overflow-hidden pt-2 lg:pt-6" aria-label="Welcome">
      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-emerald-500/8 blur-3xl" />

      <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-6 lg:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-heading text-[2.75rem] font-bold leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
              Find fire.
              <br />
              <span className="relative inline-block text-emerald-400">
                Avoid boof.
                <svg
                  className="absolute -bottom-1 left-0 w-full text-emerald-500/70"
                  viewBox="0 0 200 12"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M2 8C40 2 80 10 120 6C150 3 175 8 198 4"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg">
              Real cannabis reports from real people. Better products. Better
              prices. Smarter choices.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <button
              type="button"
              onClick={onOpenMap}
              className="btn-white inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold"
            >
              <MapPin className="h-4 w-4" />
              Open the Map
            </button>
            <Link
              href="/report"
              className="btn-dark inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold"
            >
              <Zap className="h-4 w-4" />
              Report Boof
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="flex -space-x-2">
              {["DR", "MK", "JT", "AL"].map((initials, i) => (
                <div
                  key={initials}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#050505] bg-gradient-to-br from-zinc-700 to-zinc-800 text-[10px] font-bold text-zinc-300"
                  style={{ zIndex: 4 - i }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-zinc-500">
              <span className="font-semibold text-zinc-300">
                {totalReports.toLocaleString()}+
              </span>{" "}
              reports in Michigan
            </p>
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
