import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductScoreWidget } from "@/components/widget/ProductScoreWidget";
import { fetchProductScore } from "@/lib/convex/queries";
import type { ProductIntelligenceScore } from "@/lib/intelligence/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const score = await fetchProductScore(id);
  return {
    title: score
      ? `${score.product_name} — BoofMap Intelligence`
      : "Product Intelligence Widget",
    robots: { index: false, follow: false },
  };
}

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const score = await fetchProductScore(id);
  if (!score) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-2">
      <ProductScoreWidget score={score as ProductIntelligenceScore} />
    </div>
  );
}
