"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Map, Plus } from "lucide-react";

export function ReportSuccess({
  variant = "product",
  onReportAnother,
}: {
  variant?: "product" | "meetup";
  onReportAnother?: () => void;
}) {
  const reportsHref =
    variant === "meetup" ? "/reports?tab=meetup" : "/reports";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-zinc-900/80 p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20"
      >
        <CheckCircle2 className="h-9 w-9 text-emerald-400" />
      </motion.div>

      <h3 className="mt-5 font-heading text-xl font-bold text-white">
        Report is live
      </h3>
      <p className="mt-2 text-sm text-zinc-400">
        It&apos;s on the map and feed now. Check Profile → Your reports anytime,
        or browse the live feed.
      </p>

      <p className="mt-3 text-xs font-medium uppercase tracking-wider text-emerald-400/90">
        Real reports. Real smoke. Real-time.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        <Link href={reportsHref} className="btn-primary w-full">
          <Map className="mr-2 inline h-4 w-4" />
          View community reports
        </Link>
        {onReportAnother && (
          <button
            type="button"
            onClick={onReportAnother}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/60 px-6 py-3.5 text-sm font-semibold text-white hover:border-zinc-600"
          >
            <Plus className="h-4 w-4" />
            Submit another report
          </button>
        )}
      </div>
    </motion.div>
  );
}
