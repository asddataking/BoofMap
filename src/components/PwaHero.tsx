"use client";

import Link from "next/link";
import { Globe, MapPin, PlusCircle } from "lucide-react";
import { InstallPrompt } from "./InstallPrompt";

export function PwaHero() {
  const scrollToMap = () => {
    document.getElementById("map")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="space-y-4 pt-2" aria-label="Welcome">
      <div className="glass-card space-y-4 p-5">
        <div className="flex items-center gap-2 text-emerald-400/90">
          <Globe className="h-4 w-4 shrink-0" />
          <p className="text-xs font-medium leading-snug text-[var(--text-muted)]">
            BoofMap runs right in your browser.{" "}
            <span className="text-[var(--text-main)]">No app store required.</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={scrollToMap}
            className="btn-primary flex flex-1 items-center justify-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Open the Map
          </button>
          <Link
            href="/report"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)]/60 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-[var(--accent-border)] hover:bg-[var(--bg-elevated)] active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4 text-red-400" />
            Report Boof
          </Link>
        </div>

        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            scrollToMap();
          }}
          className="block text-center text-xs font-medium text-emerald-500/80 hover:text-emerald-400"
        >
          Open BoofMap
        </Link>
      </div>

      <InstallPrompt />
    </section>
  );
}
