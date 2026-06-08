"use client";

import { motion } from "framer-motion";
import { IntelGridOverlay, RadarPulse } from "../IntelGridOverlay";

export function IntelLandingHero({
  kicker,
  title,
  titleAccent,
  subtitle,
  tagline,
  children,
  accent = "green",
}: {
  kicker: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  tagline?: string;
  children?: React.ReactNode;
  accent?: "green" | "neutral";
}) {
  const accentBorder =
    accent === "green" ? "border-[#39FF88]/25" : "border-[var(--border-soft)]";
  const accentGlow =
    accent === "green"
      ? "from-[#39FF88]/10 via-[var(--bg-card)] to-[var(--bg-card)]"
      : "from-white/[0.03] via-[var(--bg-card)] to-[var(--bg-card)]";

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-8 lg:p-14 ${accentBorder} ${accentGlow}`}
    >
      <IntelGridOverlay />
      <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 opacity-40">
        <RadarPulse className="h-full w-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mx-auto max-w-3xl text-center"
      >
        <p className="section-kicker">{kicker}</p>
        <h1 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-[var(--text-main)] sm:text-5xl lg:text-6xl">
          {title}
          {titleAccent && (
            <span className="mt-1 block text-[#39FF88] drop-shadow-[0_0_32px_rgba(57,255,136,0.25)]">
              {titleAccent}
            </span>
          )}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--text-muted)]">
          {subtitle}
        </p>
        {tagline && (
          <p className="mt-3 font-display text-sm font-bold uppercase tracking-[0.18em] text-[#39FF88]/80">
            {tagline}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </motion.div>
    </section>
  );
}
