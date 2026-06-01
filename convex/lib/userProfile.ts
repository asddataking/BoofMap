const ROLE_BY_LEVEL: { minLevel: number; title: string }[] = [
  { minLevel: 10, title: "Boof Watch Captain" },
  { minLevel: 7, title: "Fire Spotter" },
  { minLevel: 5, title: "Community Scout" },
  { minLevel: 3, title: "Street Reporter" },
  { minLevel: 1, title: "Rookie Snooper" },
];

export function levelFromPoints(points: number): number {
  return Math.max(1, Math.floor(points / 100) + 1);
}

export function roleTitleForLevel(level: number): string {
  return (
    ROLE_BY_LEVEL.find((r) => level >= r.minLevel)?.title ?? "Rookie Snooper"
  );
}

export const POINTS_PER_REPORT = 25;
