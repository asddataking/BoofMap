import { NextResponse } from "next/server";
import { fetchProductIntelligence } from "@/lib/convex/queries";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const intelligence = await fetchProductIntelligence(id);

  if (!intelligence) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      productName: intelligence.product_name,
      communityScore: intelligence.community_score,
      flavorScore: intelligence.flavor_score,
      burnScore: intelligence.burn_score,
      valueScore: intelligence.value_score,
      freshnessScore: intelligence.freshness_score,
      reportCount: intelligence.report_count,
      forecastBullishPercent: intelligence.forecast_bullish_percent,
      trendDirection: intelligence.trend_direction,
    },
    { headers: CORS_HEADERS }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
