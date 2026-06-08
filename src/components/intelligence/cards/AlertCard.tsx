"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export function AlertCard({
  name,
  subtitle,
  score,
  href,
  meta,
  index = 0,
  variant = "boof",
}: {
  name: string;
  subtitle?: string;
  score?: number;
  href?: string;
  meta?: string;
  index?: number;
  variant?: "boof" | "warning";
}) {
  const accent = variant === "warning" ? "#FF7A00" : "#FF3B3B";

  const inner = (
    <motion.article
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative w-[240px] shrink-0 overflow-hidden rounded-xl border p-4 sm:w-[260px]"
      style={{
        borderColor: `${accent}40`,
        background: `linear-gradient(135deg, ${accent}0a 0%, var(--bg-card) 60%)`,
        boxShadow: `0 0 24px ${accent}12`,
      }}
    >
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ background: accent }}
      />
      <div className="relative pl-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: `${accent}20`, color: accent }}
        >
          <AlertTriangle className="h-4 w-4" />
        </div>
        <h3 className="mt-3 font-display text-base font-extrabold uppercase leading-tight tracking-tight text-[var(--text-main)]">
          {name}
        </h3>
        {subtitle && (
          <p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p>
        )}
        {score != null && (
          <p className="mt-2 font-display text-xl font-black tabular-nums" style={{ color: accent }}>
            {score.toFixed(1)}
          </p>
        )}
        {meta && (
          <p className="mt-2 text-[10px] text-[var(--text-muted)]">{meta}</p>
        )}
      </div>
    </motion.article>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}
