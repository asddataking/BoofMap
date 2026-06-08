"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({
  kicker,
  title,
  subtitle,
  href,
  linkLabel = "View all",
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-[#39FF88]">
          {kicker}
        </p>
        <h2 className="font-display text-2xl font-black uppercase tracking-tight text-[var(--text-main)] sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 max-w-xl text-sm text-[var(--text-muted)]">
            {subtitle}
          </p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 font-display text-xs font-bold uppercase tracking-wider text-[#39FF88] transition hover:text-[#39FF88]/80"
        >
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}
