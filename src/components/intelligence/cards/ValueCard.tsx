"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";

export function ValueCard({
  name,
  subtitle,
  score,
  price,
  href,
  meta,
  index = 0,
}: {
  name: string;
  subtitle?: string;
  score?: number;
  price?: number;
  href?: string;
  meta?: string;
  index?: number;
}) {
  const inner = (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative w-[240px] shrink-0 overflow-hidden rounded-xl border border-[#FFD23F]/25 bg-gradient-to-br from-[#FFD23F]/6 to-[var(--bg-card)] p-4 shadow-[0_0_20px_rgba(255,210,63,0.06)] transition hover:border-[#FFD23F]/40 sm:w-[260px]"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFD23F]/15 text-[#FFD23F]">
          <DollarSign className="h-4 w-4" />
        </div>
        {price != null && (
          <span className="font-display text-sm font-black text-[#FFD23F]">
            ${price}
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-base font-extrabold uppercase leading-tight text-[var(--text-main)]">
        {name}
      </h3>
      {subtitle && (
        <p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p>
      )}
      {score != null && (
        <p className="mt-2 font-display text-lg font-bold text-[#FFD23F]">
          {score.toFixed(1)} value score
        </p>
      )}
      {meta && <p className="mt-2 text-[10px] text-[var(--text-muted)]">{meta}</p>}
    </motion.article>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}
