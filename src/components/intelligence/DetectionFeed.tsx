"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useDetections } from "@/hooks/useIntelligenceData";
import { FireCard } from "./cards/FireCard";
import { AlertCard } from "./cards/AlertCard";
import { ValueCard } from "./cards/ValueCard";
import type { Detection } from "@/lib/intelligence/types";
import { formatTimeAgo, slugify } from "@/lib/utils";
import type { MeetupReport, Report } from "@/lib/types";
import { getMarkerTier } from "@/lib/markers";
import { detectionTypeFromScore } from "@/lib/intelligence/constants";

type FeedTab = "fire" | "boof" | "value" | "warnings" | "fresh";

const TABS: { id: FeedTab; label: string }[] = [
  { id: "fire", label: "🔥 Fire" },
  { id: "boof", label: "🚨 Boof" },
  { id: "value", label: "💰 Value" },
  { id: "warnings", label: "⚠️ Warnings" },
  { id: "fresh", label: "✨ Fresh" },
];

function reportToDetection(r: Report): Detection {
  const type = detectionTypeFromScore(
    r.boof_score,
    r.issue_tags,
    r.price_paid
  );
  return {
    id: r.id,
    type,
    user_id: r.user_id ?? "",
    product_name: r.strain_name,
    brand_name: r.brand_name,
    dispensary_name: r.dispensary_name,
    city: r.city,
    confidence_score: Math.min(
      99,
      Math.round(r.boof_score * 18 + (r.confirm_count ?? 0) * 3)
    ),
    confirmations: r.confirm_count ?? 0,
    image_url: r.image_url,
    issue_tags: r.issue_tags,
    created_at: r.created_at,
  };
}

function renderDetectionCard(d: Detection, i: number) {
  const href = `/brands/${slugify(d.brand_name)}`;
  const meta = `${d.city}, MI · ${formatTimeAgo(d.created_at)} · ${d.confirmations} confirmed`;

  if (d.type === "fire") {
    return (
      <FireCard
        key={d.id}
        name={d.product_name}
        subtitle={d.brand_name}
        score={d.confidence_score / 20}
        href={href}
        meta={meta}
        index={i}
        featured={i === 0}
      />
    );
  }
  if (d.type === "boof" || d.type === "warning") {
    return (
      <AlertCard
        key={d.id}
        name={d.product_name}
        subtitle={d.brand_name}
        score={d.confidence_score / 20}
        href={href}
        meta={meta}
        index={i}
        variant={d.type === "warning" ? "warning" : "boof"}
      />
    );
  }
  return (
    <ValueCard
      key={d.id}
      name={d.product_name}
      subtitle={d.brand_name}
      score={d.confidence_score / 20}
      href={href}
      meta={meta}
      index={i}
    />
  );
}

export function DetectionFeed({
  reports = [],
  meetups = [],
}: {
  reports?: Report[];
  meetups?: MeetupReport[];
}) {
  const [activeTab, setActiveTab] = useState<FeedTab>("fire");
  const tablistId = useId();
  const panelId = useId();

  const fireDetections = useDetections("fire");
  const boofDetections = useDetections("boof");
  const valueDetections = useDetections("value");
  const warningDetections = useDetections("warning");

  const freshFromReports = useMemo(
    () => reports.slice(0, 10).map(reportToDetection),
    [reports]
  );

  const detections = useMemo(() => {
    switch (activeTab) {
      case "fire":
        return fireDetections.length
          ? fireDetections
          : freshFromReports.filter((d) => d.type === "fire");
      case "boof":
        return boofDetections.length
          ? boofDetections
          : freshFromReports.filter((d) => d.type === "boof");
      case "value":
        return valueDetections.length
          ? valueDetections
          : freshFromReports.filter((d) => d.type === "value");
      case "warnings":
        return warningDetections.length
          ? warningDetections
          : freshFromReports.filter((d) => d.type === "warning");
      case "fresh":
        return freshFromReports.length
          ? freshFromReports
          : reports
              .filter((r) => getMarkerTier(r) === "fire")
              .slice(0, 6)
              .map(reportToDetection);
      default:
        return [];
    }
  }, [
    activeTab,
    fireDetections,
    boofDetections,
    valueDetections,
    warningDetections,
    freshFromReports,
    reports,
  ]);

  const meetupCount = meetups.length;

  return (
    <section id="detections" className="scroll-mt-24" aria-label="Latest detections">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39FF88] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#39FF88]" />
            </span>
            <p className="section-kicker !mb-0">Live Feed</p>
          </div>
          <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[var(--text-main)] sm:text-3xl">
            Latest Detections
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Community intelligence streaming in real time
            {meetupCount > 0 && ` · ${meetupCount} meetup signals`}
          </p>
        </div>
        <Link
          href="/reports"
          className="group hidden shrink-0 items-center gap-1 text-sm font-semibold text-[#39FF88] sm:inline-flex"
        >
          Full intel map
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div
        role="tablist"
        aria-label="Filter detections"
        className="mt-5 flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
      >
        {TABS.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`${tablistId}-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 font-display text-xs font-bold uppercase tracking-wide transition sm:text-sm ${
                selected
                  ? "border-[#39FF88]/50 bg-[#39FF88]/12 text-[#39FF88] shadow-[0_0_20px_rgba(57,255,136,0.15)]"
                  : "border-[var(--border-soft)] bg-[var(--bg-panel)] text-[var(--text-muted)] hover:border-white/15 hover:text-[var(--text-main)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          id={panelId}
          role="tabpanel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-5"
        >
          {detections.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin lg:gap-4">
              {detections.map((d, i) => renderDetectionCard(d, i))}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-10 text-center">
              <p className="text-sm text-[var(--text-muted)]">
                No detections in this channel yet. Be the first signal.
              </p>
              <Link href="/report" className="btn-primary mt-4 inline-flex px-6 py-3">
                Submit Detection
              </Link>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
