"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { ScoreRing } from "./ScoreRing";
import { IssueTag } from "./IssueTag";
import type { Report } from "@/lib/types";
import { getMarkerTier, reportBadgeLabel, tierStyles } from "@/lib/markers";
import { formatTimeAgo, slugify } from "@/lib/utils";

export function LandingReportCard({
  report,
  index = 0,
}: {
  report: Report;
  index?: number;
}) {
  const tier = getMarkerTier(report);
  const styles = tierStyles[tier];

  return (
    <motion.article
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="glass-card w-[280px] shrink-0 overflow-hidden sm:w-[300px]"
    >
      <div className="relative aspect-[4/3] bg-[var(--bg-elevated)]">
        {report.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={report.image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 text-xs text-[var(--text-muted)]">
            No photo
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${styles.badge}`}
        >
          {reportBadgeLabel(report)}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-base font-bold text-white">
              {report.strain_name}
            </h3>
            <p className="mt-0.5 truncate text-sm text-[var(--text-muted)]">
              <Link
                href={`/brands/${slugify(report.brand_name)}`}
                className="hover:text-emerald-400"
              >
                {report.brand_name}
              </Link>
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <MapPin className="h-3 w-3 shrink-0" />
              {report.city}, MI ·{" "}
              <span className="capitalize">{report.product_type}</span>
            </p>
          </div>
          <ScoreRing score={report.boof_score} size={44} />
        </div>

        {report.issue_tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {report.issue_tags.slice(0, 3).map((tag) => (
              <IssueTag key={tag} tag={tag} small />
            ))}
          </div>
        )}

        <p className="mt-3 text-[11px] text-[var(--text-muted)]">
          {formatTimeAgo(report.created_at)}
        </p>
      </div>
    </motion.article>
  );
}
