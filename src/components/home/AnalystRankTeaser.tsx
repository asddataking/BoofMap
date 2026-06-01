import Link from "next/link";

/** One-line rank promo for logged-out homepage visitors. */
export function AnalystRankTeaser() {
  return (
    <p className="mt-3 text-sm text-[var(--text-muted)]">
      Earn analyst ranks from{" "}
      <span className="text-[var(--text-main)]">Rookie Reporter</span> up to{" "}
      <span className="font-medium text-[#39FF88]">Smoke GM</span> — report,
      confirm intel, and climb the ladder.{" "}
      <Link
        href="/profile"
        className="font-medium text-[#39FF88] underline-offset-2 hover:underline"
      >
        See ranks on your profile
      </Link>
      .
    </p>
  );
}
