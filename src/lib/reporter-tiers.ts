import type { BoofUser, UserProfile } from "@/lib/types";

/** Community reporter ranks (matches convex/users.ts tierTitle). */
export const REPORTER_TIERS = [
  {
    title: "Rookie Reporter",
    unlock: "New members",
  },
  {
    title: "Scout",
    unlock: "5+ reports or 200+ rep",
  },
  {
    title: "Field Analyst",
    unlock: "20+ reports or 800+ rep",
  },
  {
    title: "Smoke GM",
    unlock: "50+ reports or 2,000+ rep",
  },
] as const;

export function analystCardHeading(roleTitle?: string | null): string {
  if (roleTitle) return `Your ${roleTitle} card`;
  return "Your analyst card";
}

export function tierTitleFromStats(
  reputation: number,
  reportCount: number
): string {
  if (reportCount >= 50 || reputation >= 2000) return "Smoke GM";
  if (reportCount >= 20 || reputation >= 800) return "Field Analyst";
  if (reportCount >= 5 || reputation >= 200) return "Scout";
  return "Rookie Reporter";
}

function badgesFromStats(reputation: number, reportCount: number): string[] {
  const badges: string[] = [];
  if (reportCount >= 1) badges.push("Early Reporter");
  if (reportCount >= 10) badges.push("Boof Hunter");
  if (reputation >= 500) badges.push("Fire Scout");
  if (reportCount >= 25) badges.push("Trusted Voice");
  return badges.length ? badges : ["Community Member"];
}

/** Fallback when full analyst profile query is unavailable. */
export function profileFromBoofUser(user: BoofUser): UserProfile {
  const { reputation, report_count: reportCount } = user;
  return {
    user_id: user.uid,
    display_name: user.display_name ?? null,
    role_title: tierTitleFromStats(reputation, reportCount),
    level: Math.max(1, Math.floor(reputation / 100) + 1),
    points: reputation,
    report_count: reportCount,
    streak_count: Math.min(30, Math.floor(reportCount / 2) + 1),
    accuracy_score:
      reportCount > 0 ? Math.min(99, 70 + Math.floor(reputation / 50)) : null,
    badges: badgesFromStats(reputation, reportCount),
    updated_at: new Date().toISOString(),
  };
}
