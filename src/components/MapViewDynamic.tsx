"use client";

import dynamic from "next/dynamic";
import type { MeetupReport, Report } from "@/lib/types";

const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-[var(--bg-elevated)]">
      <div className="h-8 w-8 animate-pulse rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
    </div>
  ),
});

export function MapViewDynamic(props: {
  reports: Report[];
  meetups?: MeetupReport[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}) {
  return <MapView {...props} />;
}
