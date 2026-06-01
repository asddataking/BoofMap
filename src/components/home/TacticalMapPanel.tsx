"use client";

import { motion } from "framer-motion";
import { Flame, MapPin, Radio, Skull } from "lucide-react";
import { MapViewDynamic } from "@/components/MapViewDynamic";
import type { Report } from "@/lib/types";
import { getMarkerTier } from "@/lib/markers";

const DEMO_MARKERS = [
  { top: "22%", left: "28%", tier: "fire" as const },
  { top: "38%", left: "62%", tier: "boof" as const },
  { top: "55%", left: "44%", tier: "fire" as const },
  { top: "68%", left: "72%", tier: "mid" as const },
  { top: "32%", left: "78%", tier: "boof" as const },
];

const markerGlow = {
  fire: "bg-[#39FF88] shadow-[0_0_16px_rgba(57,255,136,0.9)]",
  boof: "bg-[#FF3B3B] shadow-[0_0_16px_rgba(255,59,59,0.9)]",
  mid: "bg-[#FFD23F] shadow-[0_0_14px_rgba(255,210,63,0.85)]",
  taxed: "bg-[#FF7A00] shadow-[0_0_14px_rgba(255,122,0,0.85)]",
};

export function TacticalMapPanel({
  reports,
  onOpenMap,
}: {
  reports: Report[];
  onOpenMap: () => void;
}) {
  const mapReports = reports.filter((r) => r.latitude && r.longitude).slice(0, 40);
  const useDemo = mapReports.length < 3;

  return (
    <div className="relative w-full max-w-lg lg:max-w-none">
      <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-[#39FF88]/10 via-transparent to-[#FF3B3B]/10 blur-xl" />
      <div className="relative overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--bg-panel)] shadow-[0_24px_64px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between gap-2 border-b border-[var(--border-soft)] bg-[var(--bg-card)] px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39FF88] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#39FF88]" />
            </span>
            <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-[#39FF88]">
              Live Map
            </span>
          </div>
          <span className="text-[10px] font-medium text-[var(--text-muted)]">
            Updates every 30s
          </span>
        </div>

        <div className="relative h-[280px] bg-[#050807] sm:h-[320px] lg:h-[380px]">
          {useDemo ? (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,136,0.06),transparent_60%),linear-gradient(180deg,#0B0F0C_0%,#050807_100%)]">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              {DEMO_MARKERS.map((m, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                  className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${markerGlow[m.tier === "mid" ? "mid" : m.tier]}`}
                  style={{ top: m.top, left: m.left }}
                />
              ))}
            </div>
          ) : (
            <MapViewDynamic
              reports={mapReports}
              center={[42.33, -83.05]}
              zoom={9}
              className="h-full opacity-90"
            />
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050807] via-transparent to-[#050807]/40" />

          <div className="absolute bottom-3 left-3 rounded-lg border border-[var(--border-soft)] bg-[var(--bg-card)]/95 px-2.5 py-2 backdrop-blur-sm">
            <p className="font-display text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Intel key
            </p>
            <ul className="mt-1.5 space-y-1">
              <LegendDot color={markerGlow.fire} label="Fire Finds" />
              <LegendDot color={markerGlow.boof} label="Boof Alerts" />
              <LegendDot color={markerGlow.mid} label="Hot Areas" />
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-soft)] bg-[var(--bg-card)] px-3 py-3 sm:px-4">
          <div className="flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1">
              <Flame className="h-3 w-3 text-[#39FF88]" />
              {reports.filter((r) => getMarkerTier(r) === "fire").length} fire
            </span>
            <span className="inline-flex items-center gap-1">
              <Skull className="h-3 w-3 text-[#FF3B3B]" />
              {reports.filter((r) => getMarkerTier(r) === "boof").length} boof
            </span>
            <span className="inline-flex items-center gap-1">
              <Radio className="h-3 w-3 text-[#FFD23F]" />
              {reports.length} signals
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenMap}
            className="btn-secondary !rounded-lg !px-3 !py-2 text-xs"
          >
            <MapPin className="mr-1 inline h-3.5 w-3.5" />
            View Full Map
          </button>
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <li className="flex items-center gap-2 text-[10px] text-[var(--text-main)]">
      <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} />
      {label}
    </li>
  );
}
