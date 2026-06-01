"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, MessageSquareQuote, ThumbsDown, ThumbsUp } from "lucide-react";
import { IntelScore } from "@/components/IntelScore";
import { IssueTag } from "@/components/IssueTag";
import { boofScoreToIntel, intelVerdictFromBoofScore } from "@/lib/intelScore";
import { getMarkerTier, reportBadgeLabel } from "@/lib/markers";
import type { Report } from "@/lib/types";
import { cn, formatPrice, formatTimeAgo, slugify } from "@/lib/utils";

const tierBorder = {
  fire: "border-l-[#39FF88]",
  boof: "border-l-[#FF3B3B]",
  taxed: "border-l-[#FF7A00]",
  mid: "border-l-[#FFD23F]",
};

const tierBadge = {
  fire: "bg-[#39FF88]/10 text-[#39FF88] border-[#39FF88]/30",
  boof: "bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]/30",
  taxed: "bg-[#FF7A00]/10 text-[#FF7A00] border-[#FF7A00]/30",
  mid: "bg-[#FFD23F]/10 text-[#FFD23F] border-[#FFD23F]/30",
};

export function AnalyticalReportCard({
  report,
  index = 0,
  onConfirm,
  onDownvote,
}: {
  report: Report;
  index?: number;
  onConfirm?: () => void;
  onDownvote?: () => void;
}) {
  const tier = getMarkerTier(report);
  const intel = boofScoreToIntel(report.boof_score);
  const verdict = intelVerdictFromBoofScore(report.boof_score);
  const confirms = report.confirm_count ?? 0;
  const downvotes = report.downvote_count ?? 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className={cn(
        "overflow-hidden rounded-xl border border-[var(--border-soft)] border-l-4 bg-[var(--bg-card)]",
        tierBorder[tier]
      )}
    >
      <div className="border-b border-[var(--border-soft)] bg-[var(--bg-panel)] px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "font-display rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  tierBadge[tier]
                )}
              >
                {reportBadgeLabel(report)}
              </span>
              <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {verdict} · {intel} intel
              </span>
            </div>
            <h3 className="mt-2 font-display text-lg font-bold text-[var(--text-main)]">
              {report.strain_name}
            </h3>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              <Link
                href={`/brands/${slugify(report.brand_name)}`}
                className="text-[#39FF88] hover:underline"
              >
                {report.brand_name}
              </Link>
              <span className="text-[var(--text-muted)]"> · </span>
              <Link
                href={`/dispensaries/${slugify(report.dispensary_name)}`}
                className="hover:text-[var(--text-main)] hover:underline"
              >
                {report.dispensary_name}
              </Link>
            </p>
          </div>
          <IntelScore boofScore={report.boof_score} size={52} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px border-b border-[var(--border-soft)] bg-[var(--border-soft)] sm:grid-cols-4">
        <MetricCell label="Product" value={report.product_type} capitalize />
        <MetricCell label="Market" value={`${report.city}, MI`} />
        <MetricCell label="Paid" value={formatPrice(report.price_paid)} />
        <MetricCell label="Logged" value={formatTimeAgo(report.created_at)} />
      </div>

      {report.issue_tags.length > 0 && (
        <div className="border-b border-[var(--border-soft)] px-4 py-3">
          <p className="font-display text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Signal flags
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {report.issue_tags.map((tag) => (
              <IssueTag key={tag} tag={tag} small />
            ))}
          </div>
        </div>
      )}

      {report.notes && (
        <div className="border-b border-[var(--border-soft)] px-4 py-3">
          <p className="flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <MessageSquareQuote className="h-3.5 w-3.5" aria-hidden />
            Community said
          </p>
          <blockquote className="mt-2 border-l-2 border-[#39FF88]/40 pl-3 text-sm leading-relaxed text-[var(--text-main)]">
            {report.notes}
          </blockquote>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 px-4 py-3 text-xs text-[var(--text-muted)]">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          {report.latitude != null && report.longitude != null
            ? "On map"
            : "No pin"}
        </span>
        <span>
          <strong className="text-[var(--text-main)]">{confirms}</strong> confirms
        </span>
        <span>
          <strong className="text-[var(--text-main)]">{downvotes}</strong> disputes
        </span>
        {report.package_date && (
          <span>
            Packaged{" "}
            <strong className="text-[var(--text-main)]">{report.package_date}</strong>
          </span>
        )}
      </div>

      <div className="flex gap-2 border-t border-[var(--border-soft)] bg-[var(--bg-panel)] p-3">
        {report.image_url && (
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[var(--border-soft)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={report.image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <button
          type="button"
          onClick={onConfirm}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#39FF88]/25 bg-[#39FF88]/10 py-2.5 text-xs font-semibold text-[#39FF88] transition hover:bg-[#39FF88]/15"
        >
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
          Confirm ({confirms})
        </button>
        <button
          type="button"
          onClick={onDownvote}
          className="flex items-center justify-center gap-1 rounded-lg border border-[var(--border-soft)] px-4 py-2.5 text-xs font-medium text-[var(--text-muted)] transition hover:border-[#FF3B3B]/30 hover:text-[#FF3B3B]"
        >
          <ThumbsDown className="h-3.5 w-3.5" aria-hidden />
          {downvotes}
        </button>
      </div>
    </motion.article>
  );
}

function MetricCell({
  label,
  value,
  capitalize: cap,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="bg-[var(--bg-card)] px-3 py-2.5">
      <p className="font-display text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-sm font-semibold tabular-nums text-[var(--text-main)]",
          cap && "capitalize"
        )}
      >
        {value}
      </p>
    </div>
  );
}
