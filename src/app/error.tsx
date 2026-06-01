"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BoofLogo } from "@/components/BoofLogo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
      <BoofLogo size="lg" showBeta={false} className="justify-center" />
      <h1 className="mt-6 font-display text-xl font-extrabold uppercase tracking-tight text-[var(--text-main)]">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">
        Live data failed to load. Try again, or head back to the map.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-primary" onClick={() => reset()}>
          Try again
        </button>
        <Link href="/reports" className="btn-secondary">
          Map &amp; reports
        </Link>
      </div>
    </div>
  );
}
