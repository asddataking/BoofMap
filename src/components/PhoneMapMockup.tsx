"use client";

import { MapViewDynamic } from "./MapViewDynamic";
import type { Report } from "@/lib/types";
import { AlertTriangle, DollarSign, Flame, Leaf } from "lucide-react";

export function PhoneMapMockup({
  reports,
  stats,
}: {
  reports: Report[];
  stats: {
    boofReports: number;
    taxedAlerts: number;
    fireFinds: number;
    midProducts: number;
  };
}) {
  const chips = [
    { label: "Boof Alerts", value: stats.boofReports, icon: AlertTriangle, color: "text-red-400" },
    { label: "Taxed Nearby", value: stats.taxedAlerts, icon: DollarSign, color: "text-orange-400" },
    { label: "Fire Finds", value: stats.fireFinds, icon: Flame, color: "text-emerald-400" },
    { label: "Mid Products", value: stats.midProducts, icon: Leaf, color: "text-amber-400" },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[320px] lg:max-w-[360px]">
      <div className="absolute -inset-4 rounded-[3rem] bg-emerald-500/5 blur-2xl" />
      <div
        className="phone-mockup relative rotate-[4deg] transition-transform duration-500 hover:rotate-[2deg] lg:rotate-[6deg]"
      >
        <div className="overflow-hidden rounded-[2.5rem] border-[3px] border-zinc-700 bg-zinc-950 shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-center gap-2 bg-zinc-900 py-2">
            <div className="h-1 w-12 rounded-full bg-zinc-700" />
          </div>

          <div className="relative h-[420px] bg-zinc-950">
            <MapViewDynamic
              reports={reports.slice(0, 30)}
              center={[42.33, -83.05]}
              zoom={11}
              className="h-full"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent p-3 pt-10">
              <div className="grid grid-cols-2 gap-2">
                {chips.map(({ label, value, icon: Icon, color }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-zinc-800/80 bg-zinc-900/90 px-2.5 py-2 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-3 w-3 ${color}`} />
                      <span className="text-[10px] font-medium text-zinc-400">
                        {label}
                      </span>
                    </div>
                    <p className="mt-0.5 font-heading text-lg font-bold text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-1 bg-zinc-900" />
        </div>
      </div>
    </div>
  );
}
