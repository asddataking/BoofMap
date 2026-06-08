import Link from "next/link";
import {
  BarChart3,
  DollarSign,
  Flame,
  Leaf,
  Shield,
  Sparkles,
} from "lucide-react";

const PILLARS = [
  {
    icon: Shield,
    title: "Consumer Trust",
    description:
      "Rankings driven by verified community reports — not paid placements or dispensary listings.",
    accent: "text-[#39FF88]",
    bg: "bg-[#39FF88]/10",
  },
  {
    icon: Leaf,
    title: "Flavor Intel",
    description:
      "Community flavor scores surface terp-rich winners and hay-filled losers before you buy.",
    accent: "text-[#9AC434]",
    bg: "bg-[#9AC434]/10",
  },
  {
    icon: Flame,
    title: "Burn Quality",
    description:
      "Track ash color, harshness, and burn performance across batches and brands.",
    accent: "text-[#FF7A00]",
    bg: "bg-[#FF7A00]/10",
  },
  {
    icon: DollarSign,
    title: "Value Scores",
    description:
      "Price-to-score ratios identify budget beasts and overpriced taxed products.",
    accent: "text-[#FFD23F]",
    bg: "bg-[#FFD23F]/10",
  },
  {
    icon: Sparkles,
    title: "Freshness",
    description:
      "Package dates and report recency factor into freshness intelligence.",
    accent: "text-[#39FF88]",
    bg: "bg-[#39FF88]/10",
  },
  {
    icon: BarChart3,
    title: "Community Rankings",
    description:
      "Weekly top flower, biggest movers, hot drops, and brand momentum — updated live.",
    accent: "text-[#39FF88]",
    bg: "bg-[#39FF88]/10",
  },
];

export function BoofMapIntelligenceSection({
  brandName,
  brandSlug,
}: {
  brandName: string;
  brandSlug: string;
}) {
  return (
    <section
      className="mt-10 overflow-hidden rounded-xl border border-[#39FF88]/20 bg-gradient-to-br from-[#39FF88]/5 via-[var(--bg-card)] to-[var(--bg-card)]"
      aria-label="BoofMap Intelligence"
    >
      <div className="border-b border-[var(--border-soft)] px-6 py-5">
        <p className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-[#39FF88]">
          BoofMap Intelligence
        </p>
        <h2 className="mt-1 font-display text-xl font-black uppercase tracking-tight text-[var(--text-main)] sm:text-2xl">
          Trusted Cannabis Product Intelligence
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
          BoofMap is the trusted source for cannabis product intelligence — not a
          dispensary marketplace. {brandName} is tracked through community-powered
          flavor, burn, value, and freshness signals from real consumers.
        </p>
      </div>

      <div className="grid gap-px bg-[var(--border-soft)] sm:grid-cols-2 lg:grid-cols-3">
        {PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.title}
              className="bg-[var(--bg-card)] p-5"
            >
              <div
                className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${pillar.bg} ${pillar.accent}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-[var(--text-main)]">
                {pillar.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-muted)]">
                {pillar.description}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-soft)] px-6 py-4">
        <p className="text-xs text-[var(--text-muted)]">
          Embed BoofMap scores on your site with our intelligence widget.
        </p>
        <Link
          href={`/widget/${brandSlug}`}
          className="btn-secondary !px-4 !py-2 text-xs"
        >
          View Intelligence Widget
        </Link>
      </div>
    </section>
  );
}
