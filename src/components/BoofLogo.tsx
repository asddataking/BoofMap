"use client";

import Image from "next/image";
import Link from "next/link";
import { BOOFMAP_LOGO } from "@/lib/constants";
import { cn } from "@/lib/utils";

const sizeStyles = {
  sm: "h-9 max-w-[180px]",
  md: "h-11 max-w-[220px] sm:max-w-[260px]",
  lg: "h-28 max-w-full sm:h-36",
} as const;

export function BoofLogo({
  className,
  showBeta = true,
  size = "md",
  linkToHome = true,
}: {
  className?: string;
  showBeta?: boolean;
  size?: keyof typeof sizeStyles;
  linkToHome?: boolean;
}) {
  const image = (
    <Image
      src={BOOFMAP_LOGO.src}
      alt={BOOFMAP_LOGO.alt}
      width={BOOFMAP_LOGO.width}
      height={BOOFMAP_LOGO.height}
      className={cn("w-auto object-contain object-left", sizeStyles[size])}
      priority={size === "md"}
    />
  );

  const content = (
    <>
      {image}
      {showBeta && (
        <span className="rounded-md bg-[#39FF88] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#050807]">
          Beta
        </span>
      )}
    </>
  );

  if (!linkToHome) {
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href="/"
      aria-label="BoofMap home"
      className={cn("group inline-flex items-center gap-2", className)}
    >
      {content}
    </Link>
  );
}
