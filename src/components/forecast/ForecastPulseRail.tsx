"use client";

import { useMemo, useState } from "react";
import { ForecastPulseCard } from "./ForecastPulseCard";
import { ForecastVoteSheet } from "./ForecastVoteSheet";
import type { ForecastMarket } from "@/lib/intelligence/types";

export function ForecastPulseRail({
  markets,
  compact = false,
}: {
  markets: ForecastMarket[];
  compact?: boolean;
}) {
  const [activeMarket, setActiveMarket] = useState<ForecastMarket | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const displayMarkets = useMemo(() => markets.slice(0, compact ? 2 : 6), [markets, compact]);

  if (!displayMarkets.length) return null;

  const openSheet = (market: ForecastMarket) => {
    setActiveMarket(market);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setActiveMarket(null);
  };

  return (
    <>
      <div
        className={
          compact
            ? "grid gap-4 sm:grid-cols-2"
            : "flex gap-4 overflow-x-auto pb-2 scrollbar-thin"
        }
      >
        {displayMarkets.map((market, i) => (
          <div
            key={market.id}
            className={compact ? "" : "min-w-[280px] max-w-[320px] shrink-0"}
          >
            <ForecastPulseCard
              market={market}
              index={i}
              onForecast={openSheet}
              compact={compact}
            />
          </div>
        ))}
      </div>

      <ForecastVoteSheet
        market={activeMarket}
        open={sheetOpen}
        onClose={closeSheet}
      />
    </>
  );
}
