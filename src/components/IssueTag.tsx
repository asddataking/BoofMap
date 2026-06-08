"use client";

import { cn } from "@/lib/utils";

const tagColors: Record<string, string> = {
  Mold: "bg-red-500/15 text-red-300 border-red-500/25",
  "Overpriced / Taxed": "bg-orange-500/15 text-orange-300 border-orange-500/25",
  "Fake Sale": "bg-orange-500/15 text-orange-300 border-orange-500/25",
  "CRC Garbage": "bg-red-500/10 text-red-400 border-red-500/20",
};

export function IssueTag({
  tag,
  small = false,
}: {
  tag: string;
  small?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-full border font-medium",
        tagColors[tag] ?? "bg-[var(--bg-elevated)]/80 text-[var(--text-muted)] border-[var(--border-soft)]/50",
        small ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
      )}
    >
      {tag}
    </span>
  );
}
