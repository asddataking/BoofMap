"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, MapPin, Minus } from "lucide-react";
import { IntelScore } from "@/components/IntelScore";
import { IssueTag } from "@/components/IssueTag";
import { intelVerdictFromBoofScore, intelVerdictStyles } from "@/lib/intelScore";
import { cn } from "@/lib/utils";

export type IntelCardSignal = {
  id: string;
  href?: string;
  rank?: number;
  name: string;
  subtitle: string;
  score: number;
  change?: number;
  imageUrl?: string | null;
  issueTags?: string[];
  meta?: string;
  kind?: "fire" | "boof" | "mid" | "meetup" | "neutral";
};

function VerdictPill({ score, kind }: { score: number; kind?: IntelCardSignal["kind"] }) {
  if (kind === "meetup") {
    return (
      <span className="font-display shrink-0 rounded-md border border-fuchsia-500/50 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fuchsia-400">
        Seller Flag
      </span>
    );
  }
  const verdict = intelVerdictFromBoofScore(score);
  const styles = intelVerdictStyles[verdict];
  return (
    <span
      className={cn(
        "font-display shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        styles.border,
        styles.text,
        "bg-[var(--bg-panel)]"
      )}
    >
      {verdict}
    </span>
  );
}

function ChangeIndicator({ change }: { change?: number }) {
  if (change == null || Math.abs(change) < 0.05) {
    return (
      <span className="flex items-center gap-0.5 font-display text-xs font-bold text-[var(--text-muted)]">
        <Minus className="h-3 w-3" />
        —
      </span>
    );
  }
  const up = change > 0;
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 font-display text-sm font-bold",
        up ? "text-[#39FF88]" : "text-[#FF3B3B]"
      )}
    >
      {up ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
      {up ? "+" : "−"}
      {Math.abs(change) >= 1
        ? Math.abs(change).toFixed(Math.abs(change) >= 10 ? 0 : 1)
        : Math.abs(change).toFixed(1)}
    </span>
  );
}

export function IntelSignalCard({
  signal,
  index = 0,
  featured = false,
}: {
  signal: IntelCardSignal;
  index?: number;
  featured?: boolean;
}) {
  const glow =
    signal.kind === "boof"
      ? "hover:border-[#FF3B3B]/40 hover:shadow-[0_0_28px_rgba(255,59,59,0.15)]"
      : signal.kind === "fire"
        ? "hover:border-[#39FF88]/40 hover:shadow-[0_0_28px_rgba(57,255,136,0.18)]"
        : "hover:border-white/20";

  const borderAccent =
    featured && signal.kind === "fire"
      ? "border-[#39FF88]/35 shadow-[0_0_32px_rgba(57,255,136,0.12)]"
      : featured && signal.kind === "boof"
        ? "border-[#FF3B3B]/35 shadow-[0_0_32px_rgba(255,59,59,0.1)]"
        : "border-[var(--border-soft)]";

  const inner = (
    <>
      {signal.imageUrl ? (
        <div className="relative -mx-4 -mt-4 mb-3 h-24 overflow-hidden rounded-t-xl bg-[var(--bg-panel)] sm:-mx-5 sm:-mt-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={signal.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] to-transparent" />
        </div>
      ) : (
        <div
          className={cn(
            "mb-3 flex items-center justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--bg-panel)]",
            featured ? "h-20" : "h-14"
          )}
        >
          {signal.rank != null ? (
            <span className="font-display text-3xl font-black text-[#39FF88]/30">
              #{signal.rank}
            </span>
          ) : (
            <span className="font-display text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Live signal
            </span>
          )}
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {signal.rank != null && signal.imageUrl && (
            <span className="mb-1 inline-flex h-6 w-6 items-center justify-center rounded-md border border-[#39FF88]/25 bg-[var(--bg-panel)] font-display text-xs font-extrabold text-[#39FF88]">
              {signal.rank}
            </span>
          )}
          <p
            className={cn(
              "font-display font-bold leading-snug text-[var(--text-main)]",
              featured ? "text-base" : "text-sm"
            )}
          >
            {signal.name}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-[var(--text-muted)]">
            {signal.subtitle}
          </p>
        </div>
        <VerdictPill score={signal.score} kind={signal.kind} />
      </div>

      {signal.issueTags && signal.issueTags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {signal.issueTags.slice(0, 2).map((tag) => (
            <IssueTag key={tag} tag={tag} small />
          ))}
        </div>
      )}

      <div className="mt-4 flex items-end justify-between gap-3">
        <IntelScore boofScore={signal.score} size={featured ? 56 : 48} />
        <ChangeIndicator change={signal.change} />
      </div>

      {signal.meta && (
        <p className="mt-3 flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
          <MapPin className="h-3 w-3 shrink-0 opacity-60" />
          {signal.meta}
        </p>
      )}
    </>
  );

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className={cn(
        "relative shrink-0 rounded-xl border bg-[var(--bg-card)] p-4 transition sm:p-5",
        featured ? "min-w-[280px] lg:min-w-[300px]" : "min-w-[240px] sm:min-w-[260px]",
        borderAccent,
        glow
      )}
    >
      {signal.href ? (
        <Link href={signal.href} className="block">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </motion.article>
  );
}
