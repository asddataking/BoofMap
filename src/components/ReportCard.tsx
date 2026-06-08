"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, ThumbsDown, ThumbsUp } from "lucide-react";
import { IssueTag } from "./IssueTag";
import { ScoreBadge } from "./ScoreBadge";
import type { Report } from "@/lib/types";
import { formatPrice, formatTimeAgo, slugify } from "@/lib/utils";

export function ReportCard({
  report,
  index = 0,
  compact = false,
  onConfirm,
  onDownvote,
}: {
  report: Report;
  index?: number;
  compact?: boolean;
  onConfirm?: () => void;
  onDownvote?: () => void;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="glass-card overflow-hidden transition hover:border-[var(--border-soft)]/60"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-base font-semibold text-white">
              {report.strain_name}
            </h3>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              <Link
                href={`/brands/${slugify(report.brand_name)}`}
                className="text-emerald-400/90 hover:text-emerald-300"
              >
                {report.brand_name}
              </Link>
              <span className="text-[var(--text-muted)]"> · </span>
              <Link
                href={`/dispensaries/${slugify(report.dispensary_name)}`}
                className="hover:text-[var(--text-main)]"
              >
                {report.dispensary_name}
              </Link>
            </p>
          </div>
          <ScoreBadge score={report.boof_score} size="sm" />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="rounded-md bg-[var(--bg-elevated)] px-2 py-0.5 capitalize text-[var(--text-muted)]">
            {report.product_type}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {report.city}
          </span>
          <span>{formatPrice(report.price_paid)}</span>
          <span>{formatTimeAgo(report.created_at)}</span>
        </div>

        {report.issue_tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {report.issue_tags.map((tag) => (
              <IssueTag key={tag} tag={tag} small />
            ))}
          </div>
        )}

        {!compact && report.notes && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)]">
            {report.notes}
          </p>
        )}

        <div className="mt-3 flex items-center gap-3">
          <div className="h-14 w-14 shrink-0 rounded-xl border border-[var(--border-soft)] bg-gradient-to-br from-zinc-800/40 to-zinc-900/60 flex items-center justify-center text-[10px] text-[var(--text-muted)]">
            {report.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={report.image_url}
                alt=""
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              "Photo"
            )}
          </div>
          <div className="flex flex-1 gap-2">
            <button
              type="button"
              onClick={onConfirm}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-2 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              Confirm ({report.confirm_count ?? 0})
            </button>
            <button
              type="button"
              onClick={onDownvote}
              className="flex items-center justify-center gap-1 rounded-xl border border-[var(--border-soft)] px-3 py-2 text-xs text-[var(--text-muted)] transition hover:border-[var(--border-soft)] hover:text-[var(--text-muted)]"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              {report.downvote_count ?? 0}
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
