"use client";

import { Search } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search brand, dispo, city, strain…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
        strokeWidth={2}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)]/60 py-3 pl-10 pr-4 text-sm text-white placeholder:text-[var(--text-muted)] shadow-inner backdrop-blur-xl transition focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        aria-label="Search reports"
      />
    </div>
  );
}
