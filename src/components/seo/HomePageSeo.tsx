import Link from "next/link";
import {
  buildFaqJsonLd,
  buildOrganizationJsonLd,
  buildWebApplicationJsonLd,
  SITE_NAME,
} from "@/lib/seo";
import { JsonLdScript } from "./JsonLdScript";

export function HomePageSeoHead() {
  return (
    <>
      <JsonLdScript data={buildOrganizationJsonLd()} />
      <JsonLdScript data={buildWebApplicationJsonLd()} />
      <JsonLdScript data={buildFaqJsonLd()} />

      <header className="pt-2">
        <h1 className="font-display text-xl font-extrabold uppercase tracking-tight text-[var(--text-main)] sm:text-2xl">
          Find Fire. Avoid Boof. — Michigan Cannabis Intel
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--text-muted)]">
          {SITE_NAME} is a community-powered alternative to menu-only apps like
          Weedmaps: live map, boof alerts, fire finds, and real buyer reports
          across Michigan dispensaries and brands. Browse free — no signup
          required.
        </p>
        <nav
          className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm"
          aria-label="Quick links"
        >
          <Link
            href="/#map"
            className="text-[#39FF88] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF88]"
          >
            Live map
          </Link>
          <Link
            href="/reports"
            className="text-[#39FF88] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF88]"
          >
            All reports
          </Link>
          <Link
            href="/brands"
            className="text-[#39FF88] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF88]"
          >
            Brands
          </Link>
          <Link
            href="/report"
            className="text-[#39FF88] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF88]"
          >
            Report boof
          </Link>
          <Link
            href="/faq"
            className="text-[#39FF88] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#39FF88]"
          >
            FAQ
          </Link>
        </nav>
      </header>
    </>
  );
}

