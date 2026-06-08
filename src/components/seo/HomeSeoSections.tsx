import Link from "next/link";
import { SEO_COPY_SNIPPETS, SEO_HOME_SECTIONS } from "@/lib/seo";
import { cn } from "@/lib/utils";

export function HomeSeoSections({ asPage = false }: { asPage?: boolean }) {
  const Heading = asPage ? "h1" : "h2";

  return (
    <section
      id="cannabis-transparency-platform"
      className={cn(
        "scroll-mt-24",
        !asPage && "border-t border-[var(--border-soft)] pt-12 lg:pt-16"
      )}
      aria-labelledby="platform-heading"
    >
      <header className="max-w-3xl">
        <p className="section-kicker">Why BoofMap</p>
        <Heading
          id="platform-heading"
          className={cn(
            "font-display font-extrabold uppercase tracking-tight text-[var(--text-main)]",
            asPage ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"
          )}
        >
          Community-Powered Cannabis Transparency
        </Heading>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
          {SEO_COPY_SNIPPETS.positioning}{" "}
          {SEO_COPY_SNIPPETS.realReports}{" "}
          {SEO_COPY_SNIPPETS.avoidBadWeed}
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SEO_HOME_SECTIONS.map((section) => (
          <article
            key={section.id}
            id={section.id}
            className="scroll-mt-24 rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-4 sm:p-5"
          >
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-[var(--text-main)]">
              {section.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
              {section.body}
            </p>
          </article>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-[var(--text-muted)]">
        {SEO_COPY_SNIPPETS.tagline}{" "}
        {SEO_COPY_SNIPPETS.legalMarkets}{" "}
        <Link
          href="/reports"
          className="text-[#39FF88] underline-offset-2 hover:underline"
        >
          Browse live reports
        </Link>
        {" · "}
        <Link
          href="/brands"
          className="text-[#39FF88] underline-offset-2 hover:underline"
        >
          Brand analytics
        </Link>
        {" · "}
        <Link
          href="/report"
          className="text-[#39FF88] underline-offset-2 hover:underline"
        >
          Submit a report
        </Link>
      </p>
    </section>
  );
}
