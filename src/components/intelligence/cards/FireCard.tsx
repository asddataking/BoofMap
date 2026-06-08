"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { IntelGridOverlay } from "../IntelGridOverlay";

export function FireCard({
  name,
  subtitle,
  score,
  movement,
  href,
  meta,
  index = 0,
  featured = false,
}: {
  name: string;
  subtitle?: string;
  score: number;
  movement?: number;
  href?: string;
  meta?: string;
  index?: number;
  featured?: boolean;
}) {
  const inner = (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`group relative shrink-0 overflow-hidden rounded-xl border border-[#39FF88]/30 bg-gradient-to-br from-[#39FF88]/8 via-[var(--bg-card)] to-[var(--bg-card)] p-4 shadow-[0_0_30px_rgba(57,255,136,0.08)] transition hover:border-[#39FF88]/50 hover:shadow-[0_0_40px_rgba(57,255,136,0.15)] ${
        featured ? "w-[280px] sm:w-[300px]" : "w-[240px] sm:w-[260px]"
      }`}
    >
      <IntelGridOverlay />
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#39FF88]/15 text-[#39FF88] shadow-[0_0_16px_rgba(57,255,136,0.25)]">
            <Flame className="h-4 w-4" />
          </div>
          {movement != null && movement !== 0 && (
            <span className="font-display text-xs font-bold text-[#39FF88]">
              {movement > 0 ? `+${movement}` : movement}
            </span>
          )}
        </div>
        <h3 className="mt-3 font-display text-base font-extrabold uppercase leading-tight tracking-tight text-[var(--text-main)] group-hover:text-[#39FF88]">
          {name}
        </h3>
        {subtitle && (
          <p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p>
        )}
        <div className="mt-3 flex items-end justify-between">
          <span className="font-display text-2xl font-black tabular-nums text-[#39FF88]">
            {score.toFixed(1)}
          </span>
          <span className="font-display text-[10px] font-bold uppercase tracking-wider text-[#39FF88]/70">
            Fire Score
          </span>
        </div>
        {meta && (
          <p className="mt-2 text-[10px] text-[var(--text-muted)]">{meta}</p>
        )}
      </div>
    </motion.article>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
