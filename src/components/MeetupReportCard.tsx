"use client";

import { motion } from "framer-motion";
import { MapPin, ThumbsUp, AlertTriangle } from "lucide-react";
import { IssueTag } from "./IssueTag";
import { SellerSignalBadge } from "./SellerSignalBadge";
import type { MeetupReport } from "@/lib/types";
import { formatTimeAgo, cn } from "@/lib/utils";

export function MeetupReportCard({
  report,
  index = 0,
  onConfirm,
}: {
  report: MeetupReport;
  index?: number;
  onConfirm?: () => void;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="glass-card overflow-hidden border-purple-500/10"
    >
      <div className="p-4">
        {report.public_warning && (
          <div className="mb-3 flex gap-2 rounded-xl border border-orange-500/25 bg-orange-500/10 px-3 py-2 text-xs text-orange-200">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{report.public_warning}</span>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-base font-semibold text-white">
                {report.seller_display_name}
              </h3>
              {report.status && report.status !== "approved" && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    report.status === "rejected"
                      ? "bg-red-500/15 text-red-400"
                      : "bg-amber-500/15 text-amber-300"
                  )}
                >
                  {report.status === "flagged" ? "Under review" : report.status}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              {report.platform} · {report.meetup_type.replace("-", " ")}
            </p>
          </div>
          <SellerSignalBadge signal={report.seller_signal} size="sm" />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {report.city}
            {report.area ? ` · ${report.area}` : ""}
          </span>
          <span>{formatTimeAgo(report.created_at)}</span>
        </div>

        {report.issue_tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {report.issue_tags.map((tag) => (
              <IssueTag key={tag} tag={tag} small />
            ))}
          </div>
        )}

        {report.notes && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]">
            {report.notes}
          </p>
        )}

        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[var(--border-soft)] bg-gradient-to-br from-purple-900/20 to-zinc-900/60 text-[10px] text-[var(--text-muted)]">
            {report.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={report.image_url}
                alt=""
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              "Screenshot"
            )}
          </div>
          <button
            type="button"
            onClick={onConfirm}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-purple-500/20 bg-purple-500/10 py-2 text-xs font-medium text-purple-300 transition hover:bg-purple-500/20"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            Confirm experience ({report.confirm_count ?? 0})
          </button>
        </div>
      </div>
    </motion.article>
  );
}
