import type { Report } from "@/lib/types";

export { isConvexConfigured as isBackendConfigured } from "@/lib/convex/config";
export {
  fetchApprovedReports,
  fetchBrandNames,
  fetchBrandProfile,
  fetchDispensaryProfile,
} from "@/lib/convex/queries";

export function getBrandsFromReports(reports: Report[]): string[] {
  return [...new Set(reports.map((r) => r.brand_name))].sort();
}

export function filterReports(
  reports: Report[],
  filterId: string,
  userLat?: number,
  userLng?: number
): Report[] {
  switch (filterId) {
    case "latest":
      return [...reports].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case "near":
      if (userLat == null || userLng == null) return reports;
      return [...reports].sort((a, b) => {
        const da = dist(userLat, userLng, a.latitude, a.longitude);
        const db = dist(userLat, userLng, b.latitude, b.longitude);
        return da - db;
      });
    case "mold":
      return reports.filter((r) => r.issue_tags.includes("Mold"));
    case "taxed":
      return reports.filter((r) =>
        r.issue_tags.some((t) =>
          ["Overpriced / Taxed", "Fake Sale"].includes(t)
        )
      );
    case "no-flavor":
      return reports.filter((r) => r.issue_tags.includes("No Flavor"));
    case "dry":
      return reports.filter((r) => r.issue_tags.includes("Dry"));
    case "weak":
      return reports.filter((r) => r.issue_tags.includes("Weak High"));
    case "fire":
      return reports.filter((r) => r.boof_score >= 4.5);
    case "flower":
      return reports.filter((r) => r.product_type === "flower");
    case "carts":
      return reports.filter(
        (r) => r.product_type === "cart" || r.product_type === "disposable"
      );
    default:
      return reports;
  }
}

function dist(
  lat1: number,
  lng1: number,
  lat2?: number | null,
  lng2?: number | null
): number {
  if (lat2 == null || lng2 == null) return Infinity;
  return Math.hypot(lat1 - lat2, lng1 - lng2);
}
