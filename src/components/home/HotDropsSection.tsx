"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { FireCard } from "@/components/intelligence/cards/FireCard";
import { useHotDrops } from "@/hooks/useIntelligenceRankings";
import { SectionHeader } from "./intelligence/SectionHeader";

export function HotDropsSection() {
  const drops = useHotDrops();

  return (
    <section aria-label="Hot drops">
      <SectionHeader
        kicker="Fresh Intel"
        title="Hot Drops"
        subtitle="Recently reported products gaining traction in the community."
      />

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {drops.map((drop, i) => (
          <FireCard
            key={drop.id}
            name={drop.product_name}
            subtitle={drop.brand_name}
            score={drop.score}
            movement={drop.movement}
            href={`/products/${drop.product_slug}`}
            meta={`${drop.report_count} new reports`}
            index={i}
            featured={i === 0}
          />
        ))}
        {drops.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-w-[240px] items-center gap-3 rounded-xl border border-dashed border-[var(--border-soft)] p-6 text-sm text-[var(--text-muted)]"
          >
            <Sparkles className="h-5 w-5 text-[#FFD23F]" />
            New drops appear as the community reports.
          </motion.div>
        )}
      </div>

      <div className="mt-3 lg:hidden">
        <Link
          href="/reports"
          className="text-xs font-semibold text-[#39FF88] hover:underline"
        >
          View all fresh reports →
        </Link>
      </div>
    </section>
  );
}
