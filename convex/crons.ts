import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "recalculate rankings",
  { hours: 1 },
  internal.rankings.internalRecalculateRankings,
  {}
);

crons.interval(
  "seed forecast markets",
  { hours: 6 },
  internal.forecast.internalSeedMarkets,
  {}
);

crons.interval(
  "resolve forecast markets",
  { hours: 1 },
  internal.forecast.internalResolveExpiredMarkets,
  {}
);

export default crons;
