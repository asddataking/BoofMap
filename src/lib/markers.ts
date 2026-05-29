import type { MarkerTier, Report } from "./types";

const TAXED_TAGS = ["Overpriced / Taxed", "Fake Sale"];
const BOOF_TAGS = ["Mold", "CRC Garbage", "Leaking Cart"];

export function getMarkerTier(report: Report): MarkerTier {
  const tags = report.issue_tags ?? [];

  if (tags.some((t) => TAXED_TAGS.includes(t))) return "taxed";
  if (report.boof_score <= 2 || tags.some((t) => BOOF_TAGS.includes(t)))
    return "boof";
  if (report.boof_score >= 4.5 && tags.length <= 1) return "fire";
  if (report.boof_score >= 4) return "fire";
  return "mid";
}

export function scoreLabel(score: number): string {
  if (score <= 1.5) return "Boof Alert";
  if (score <= 2.5) return "Mostly Boof";
  if (score <= 3.5) return "Mid";
  if (score <= 4.5) return "Decent";
  return "Fire";
}

export function reportBadgeLabel(report: Report): string {
  const tier = getMarkerTier(report);
  if (tier === "boof") return "Boof Alert";
  if (tier === "taxed") return "Taxed";
  if (tier === "fire") return "Fire Find";
  return "Mid";
}

export const tierStyles: Record<
  MarkerTier,
  { badge: string; ring: string; text: string }
> = {
  boof: {
    badge: "bg-red-500/90 text-white",
    ring: "stroke-red-500",
    text: "text-red-400",
  },
  taxed: {
    badge: "bg-orange-500/90 text-white",
    ring: "stroke-orange-500",
    text: "text-orange-400",
  },
  fire: {
    badge: "bg-emerald-500/90 text-white",
    ring: "stroke-emerald-500",
    text: "text-emerald-400",
  },
  mid: {
    badge: "bg-amber-500/90 text-black",
    ring: "stroke-amber-500",
    text: "text-amber-400",
  },
};
