"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, FileText, Package, Users, Zap } from "lucide-react";
import { AnimatedCounter } from "@/components/intelligence/AnimatedCounter";
import { usePlatformStats } from "@/hooks/useIntelligenceRankings";
import { PLATFORM_TAGLINE } from "@/lib/intelligence/constants";

const STAT_ICONS = {
  reports: FileText,
  products: Package,
  brands: BarChart3,
  active_users: Users,
} as const;

export function IntelligenceHero() {
  const stats = usePlatformStats();

  const statItems = [
    { key: "reports" as const, label: "Reports", value: stats.reports },
    { key: "products" as const, label: "Products", value: stats.products },
    { key: "brands" as const, label: "Brands", value: stats.brands },
    { key: "active_users" as const, label: "Active Users", value: stats.active_users },
  ];

  return (
    <section className="relative overflow-hidden pt-2 lg:pt-4" aria-label="Welcome">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[#39FF88]/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-12 h-96 w-96 rounded-full bg-[#FF3B3B]/5 blur-3xl" />

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-[#39FF88]/30 bg-[#39FF88]/8 px-3 py-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39FF88] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#39FF88]" />
            </span>
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-[#39FF88]">
              Cannabis Intelligence Platform
            </span>
          </div>

          <h1 className="font-display font-black uppercase leading-[0.92] tracking-tight">
            <span className="block text-[clamp(2.75rem,10vw,4.5rem)] text-[#39FF88] drop-shadow-[0_0_32px_rgba(57,255,136,0.35)]">
              Find Fire.
            </span>
            <span className="mt-1 block text-[clamp(2.75rem,10vw,4.5rem)] text-[#FF3B3B] drop-shadow-[0_0_28px_rgba(255,59,59,0.3)]">
              Avoid Boof.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-muted)]">
            {PLATFORM_TAGLINE} Community-powered rankings, flavor intel, burn
            quality, and value scores — brands cannot buy trust.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          <Link
            href="/report"
            className="btn-primary inline-flex flex-1 items-center justify-center gap-2 px-6 py-3.5 sm:flex-none"
          >
            <Zap className="h-4 w-4" aria-hidden />
            Submit Intel
          </Link>
          <Link
            href="/leaderboards"
            className="btn-secondary inline-flex flex-1 items-center justify-center gap-2 px-6 py-3.5 sm:flex-none"
          >
            <BarChart3 className="h-4 w-4" aria-hidden />
            Rankings
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {statItems.map((item, i) => {
            const Icon = STAT_ICONS[item.key];
            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="relative overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-4"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(57,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,136,0.04) 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                />
                <div className="relative flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#39FF88]/12 text-[#39FF88]">
                    <Icon className="h-4 w-4" strokeWidth={2.25} />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-black tabular-nums text-[var(--text-main)] sm:text-3xl">
                      <AnimatedCounter value={item.value} />
                    </p>
                    <p className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      {item.label}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
