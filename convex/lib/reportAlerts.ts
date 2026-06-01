const HIGH_SEVERITY_TAGS = ["Mold", "CRC Garbage", "Leaking Cart"] as const;

export function isHighSeverityReport(
  issueTags: string[],
  boofScore: number
): boolean {
  if (issueTags.includes("Mold")) return true;
  if (boofScore <= 2) return true;
  return issueTags.some((t) =>
    HIGH_SEVERITY_TAGS.includes(t as (typeof HIGH_SEVERITY_TAGS)[number])
  );
}

export function severityLabel(issueTags: string[], boofScore: number): string {
  if (issueTags.includes("Mold")) return "critical";
  if (boofScore <= 1.5) return "high";
  if (boofScore <= 2) return "elevated";
  return "moderate";
}
