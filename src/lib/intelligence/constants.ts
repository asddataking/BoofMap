import type {
  AchievementId,
  DetectorRank,
  LeaderboardCategory,
} from "./types";

export const PLATFORM_NAME = "The Cannabis Intelligence Network";
export const PLATFORM_TAGLINE = "Find Fire. Avoid Boof.";

export const DETECTION_POINT_VALUES = {
  verified_detection: 10,
  batch_information: 20,
  confirmed_alert: 8,
  customer_referral: 15,
  budtender_referral: 25,
  top_monthly_contributor: 50,
} as const;

export const DETECTOR_RANKS: {
  id: DetectorRank;
  label: string;
  minPoints: number;
  badge: string;
  unlocks: string[];
}[] = [
  {
    id: "observer",
    label: "Observer",
    minPoints: 0,
    badge: "👁",
    unlocks: ["View live reports", "Save products & brands"],
  },
  {
    id: "detector",
    label: "Reporter",
    minPoints: 100,
    badge: "📡",
    unlocks: ["Submit reports", "Earn report points"],
  },
  {
    id: "investigator",
    label: "Investigator",
    minPoints: 300,
    badge: "🔍",
    unlocks: ["Verify reports", "Confirm alerts"],
  },
  {
    id: "analyst",
    label: "Analyst",
    minPoints: 750,
    badge: "📊",
    unlocks: ["Leaderboard visibility", "Batch intel submissions"],
  },
  {
    id: "chief_analyst",
    label: "Chief Analyst",
    minPoints: 2000,
    badge: "⭐",
    unlocks: ["Top contributor status", "Early access", "Merch eligibility"],
  },
];

export const ACHIEVEMENTS: {
  id: AchievementId;
  label: string;
  description: string;
  emoji: string;
}[] = [
  {
    id: "first_detection",
    label: "First Report",
    description: "Submitted your first community report",
    emoji: "🎯",
  },
  {
    id: "boof_buster",
    label: "Boof Buster",
    description: "Exposed 10+ boof signals",
    emoji: "🚨",
  },
  {
    id: "fire_finder",
    label: "Fire Finder",
    description: "Identified 10+ fire products",
    emoji: "🔥",
  },
  {
    id: "value_hunter",
    label: "Value Hunter",
    description: "Surfaced 5+ value reports",
    emoji: "💰",
  },
  {
    id: "market_analyst",
    label: "Market Analyst",
    description: "Reached Analyst rank",
    emoji: "📊",
  },
  {
    id: "top_detector",
    label: "Top Reporter",
    description: "Top monthly contributor",
    emoji: "🏆",
  },
];

export const LEADERBOARD_CATEGORIES: {
  id: LeaderboardCategory;
  label: string;
  emoji: string;
}[] = [
  { id: "top_fire_products", label: "Top Fire Products", emoji: "🔥" },
  { id: "top_fire_brands", label: "Top Fire Brands", emoji: "🏷" },
  { id: "top_value_products", label: "Top Value Products", emoji: "💰" },
  { id: "top_flower", label: "Top Flower", emoji: "🌿" },
  { id: "top_pre_rolls", label: "Top Pre-Rolls", emoji: "🚬" },
  { id: "top_rosin", label: "Top Rosin", emoji: "💎" },
  { id: "top_concentrates", label: "Top Concentrates", emoji: "🧪" },
];

export function detectorRankFromPoints(points: number): DetectorRank {
  const ranks = [...DETECTOR_RANKS].reverse();
  for (const rank of ranks) {
    if (points >= rank.minPoints) return rank.id;
  }
  return "observer";
}

export function rankProgress(points: number): number {
  const current = DETECTOR_RANKS.find((r) => points >= r.minPoints) ?? DETECTOR_RANKS[0];
  const currentIdx = DETECTOR_RANKS.findIndex((r) => r.id === current.id);
  const next = DETECTOR_RANKS[currentIdx + 1];
  if (!next) return 100;
  const range = next.minPoints - current.minPoints;
  const progress = points - current.minPoints;
  return Math.min(100, Math.round((progress / range) * 100));
}

export function detectionTypeFromScore(
  boofScore: number,
  issueTags: string[] = [],
  pricePaid?: number | null
): "fire" | "boof" | "value" | "warning" {
  if (issueTags.some((t) => /mold|fake|crc/i.test(t))) return "warning";
  if (boofScore >= 4.5) return "fire";
  if (boofScore <= 2) return "boof";
  if (pricePaid != null && pricePaid > 0 && boofScore >= 3.5 && pricePaid < 30)
    return "value";
  if (boofScore <= 2.5) return "boof";
  return "fire";
}
