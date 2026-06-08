import type { Metadata } from "next";
import { LeaderboardsClient } from "./LeaderboardsClient";

export const metadata: Metadata = {
  title: "Leaderboards — Top Fire, Value & Category Rankings",
  description:
    "Live cannabis leaderboards: top fire products, brands, value picks, flower, pre-rolls, rosin, and concentrates.",
};

export default function LeaderboardsPage() {
  return <LeaderboardsClient />;
}
