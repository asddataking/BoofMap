"use client";

import { Bell, BellRing } from "lucide-react";

export function BoofAlertCard({
  enabled,
  city,
}: {
  enabled: boolean;
  city: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
        {enabled ? (
          <BellRing className="h-5 w-5 text-emerald-400" />
        ) : (
          <Bell className="h-5 w-5 text-zinc-500" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-heading text-sm font-bold text-white">
          Boof Alerts {enabled ? "Active" : "Off"}
        </p>
        <p className="truncate text-xs text-zinc-500">
          {enabled ? `Watching ${city} for new flags` : "Enable alerts below"}
        </p>
      </div>
      {enabled && (
        <span className="shrink-0 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
          Live
        </span>
      )}
    </div>
  );
}
