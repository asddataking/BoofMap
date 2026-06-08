import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { ForecastSentimentBar } from "@/components/forecast/ForecastSentimentBar";
import type { ProductProfile, TrendDirection } from "@/lib/intelligence/types";
import { ScoreRing } from "@/components/ScoreRing";
import { FORECAST_PULSE_ENABLED } from "@/lib/intelligence/featureFlags";

const SCORE_AXES = [
  { key: "community_score" as const, label: "Community", color: "#9AC434" },
  { key: "flavor_score" as const, label: "Flavor", color: "#39FF88" },
  { key: "burn_score" as const, label: "Burn", color: "#FF7A00" },
  { key: "value_score" as const, label: "Value", color: "#FFD23F" },
  { key: "freshness_score" as const, label: "Freshness", color: "#5BC0EB" },
] as const;

function TrendIndicator({ direction }: { direction: TrendDirection }) {
  if (direction === "up") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#39FF88]">
        <TrendingUp className="h-3.5 w-3.5" />
        Rising
      </span>
    );
  }
  if (direction === "down") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF3B3B]">
        <TrendingDown className="h-3.5 w-3.5" />
        Falling
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)]">
      <Minus className="h-3.5 w-3.5" />
      Steady
    </span>
  );
}

export function ProductScoreBreakdown({ product }: { product: ProductProfile }) {
  return (
    <section aria-label="Product intelligence scores">
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        <div className="glass-card flex flex-col items-center justify-center p-6">
          <ScoreRing score={product.avg_boof_score} size={88} />
          <p className="mt-3 font-display text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Avg Boof Score
          </p>
          <div className="mt-2">
            <TrendIndicator direction={product.trend_direction} />
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {product.report_count} community report
            {product.report_count !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="glass-card p-5">
          <p className="section-kicker !mb-3">BoofMap Intelligence</p>
          <div className="space-y-4">
            {SCORE_AXES.map(({ key, label, color }) => (
              <div key={key}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-display text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {label}
                  </span>
                  <span
                    className="font-display text-sm font-black tabular-nums"
                    style={{ color }}
                  >
                    {product[key] ?? 0}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, product[key] ?? 0)}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {FORECAST_PULSE_ENABLED && product.forecast_bullish_percent != null && (
        <div className="mt-4 glass-card p-4">
          <p className="section-kicker !mb-2">Forecast Sentiment</p>
          <p className="text-sm text-[var(--text-muted)]">
            {product.forecast_bullish_percent}% of the community is bullish on
            near-term momentum.
          </p>
          <div className="mt-3">
            <ForecastSentimentBar
              bullishPercent={product.forecast_bullish_percent}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={`/brands/${product.brand_slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#39FF88] hover:underline"
        >
          View {product.brand_name} brand intel
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href={`/widget/${product.product_slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          Embed widget
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
