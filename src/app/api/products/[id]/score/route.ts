import { NextResponse } from "next/server";
import { fetchProductScore } from "@/lib/convex/queries";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const score = await fetchProductScore(id);

  if (!score) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      productName: score.product_name,
      communityScore: score.community_score,
      flavorScore: score.flavor_score,
      burnScore: score.burn_score,
      valueScore: score.value_score,
      reportCount: score.report_count,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
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
