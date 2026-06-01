export type IntelVerdict = "FIRE" | "SOLID" | "MID" | "BOOF";

export function boofScoreToIntel(score: number): number {
  return Math.round(Math.min(100, Math.max(0, (score / 5) * 100)));
}

export function intelVerdict(value: number): IntelVerdict {
  if (value >= 80) return "FIRE";
  if (value >= 55) return "SOLID";
  if (value >= 35) return "MID";
  return "BOOF";
}

export function intelVerdictFromBoofScore(score: number): IntelVerdict {
  return intelVerdict(boofScoreToIntel(score));
}

export const intelVerdictStyles: Record<
  IntelVerdict,
  { ring: string; text: string; border: string; glow: string }
> = {
  FIRE: {
    ring: "#39FF88",
    text: "text-[#39FF88]",
    border: "border-[#39FF88]/40",
    glow: "shadow-[0_0_24px_rgba(57,255,136,0.25)]",
  },
  SOLID: {
    ring: "#9AC434",
    text: "text-[#9AC434]",
    border: "border-[#9AC434]/40",
    glow: "shadow-[0_0_20px_rgba(154,196,52,0.2)]",
  },
  MID: {
    ring: "#FFD23F",
    text: "text-[#FFD23F]",
    border: "border-[#FFD23F]/40",
    glow: "shadow-[0_0_20px_rgba(255,210,63,0.15)]",
  },
  BOOF: {
    ring: "#FF3B3B",
    text: "text-[#FF3B3B]",
    border: "border-[#FF3B3B]/40",
    glow: "shadow-[0_0_24px_rgba(255,59,59,0.25)]",
  },
};
