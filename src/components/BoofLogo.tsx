"use client";

import Link from "next/link";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function BoofLogo({
  className,
  showBeta = true,
  size = "md",
}: {
  className?: string;
  showBeta?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "text-lg",
    md: "text-xl lg:text-2xl",
    lg: "text-3xl lg:text-4xl",
  };

  return (
    <Link
      href="/"
      aria-label="BoofMap home"
      className={cn("group inline-flex items-center gap-2", className)}
    >
      <span
        className={cn(
          "font-heading font-bold tracking-tight text-white",
          sizes[size]
        )}
      >
        B
        <Leaf
          className="inline h-[0.85em] w-[0.85em] -translate-y-px text-emerald-400"
          strokeWidth={2.5}
          fill="currentColor"
          fillOpacity={0.2}
          aria-hidden
        />
        OFMAP
      </span>
      {showBeta && (
        <span className="rounded-md bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black">
          Beta
        </span>
      )}
    </Link>
  );
}
