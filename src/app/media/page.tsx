import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageTransition } from "@/components/PageTransition";
import Image from "next/image";
import { BOOFMAP_LOGO } from "@/lib/constants";
import { TAGLINE } from "@/lib/constants";
import { buildPageMetadata, SITE_NAME } from "@/lib/seo";
import {
  BRAND_COLORS,
  MEDIA_CONTACT_EMAIL,
  MEDIA_KIT_PDF_FILENAME,
  MEDIA_KIT_PDF_PATH,
} from "@/lib/media";

export const metadata: Metadata = buildPageMetadata({
  title: "Media Kit",
  description:
    "BoofMap press and media resources — brand colors, positioning, and downloadable media kit PDF for Michigan cannabis community intel.",
  path: "/media",
});

export default function MediaPage() {
  return (
    <AppShell>
      <PageTransition>
        <div className="py-6 lg:py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition hover:text-[#39FF88]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>

          <header className="mt-6 max-w-2xl">
            <p className="section-kicker">Press</p>
            <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-[var(--text-main)] sm:text-4xl">
              Media Kit
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              Assets and talking points for {SITE_NAME} — {TAGLINE}
            </p>
          </header>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={MEDIA_KIT_PDF_PATH}
              download={MEDIA_KIT_PDF_FILENAME}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Download className="h-4 w-4" aria-hidden />
              Download PDF
            </a>
            <a
              href={MEDIA_KIT_PDF_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              Open in browser
            </a>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-main)]">
                Logo
              </h2>
              <div className="mt-4 flex justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--bg-panel)] p-6">
                <Image
                  src={BOOFMAP_LOGO.src}
                  alt={BOOFMAP_LOGO.alt}
                  width={BOOFMAP_LOGO.width}
                  height={BOOFMAP_LOGO.height}
                  className="h-32 w-auto max-w-full object-contain sm:h-40"
                />
              </div>
              <p className="mt-3 text-xs text-[var(--text-muted)]">
                Download PNG:{" "}
                <Link
                  href={BOOFMAP_LOGO.src}
                  download="boofmap-logo.png"
                  className="text-[#39FF88] hover:underline"
                >
                  {BOOFMAP_LOGO.src}
                </Link>
              </p>
            </section>

            <section className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-6">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-main)]">
                Brand colors
              </h2>
              <ul className="mt-4 space-y-3">
                {BRAND_COLORS.map((color) => (
                  <li
                    key={color.hex}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span
                      className="h-10 w-10 shrink-0 rounded-lg border border-[var(--border-soft)]"
                      style={{ backgroundColor: color.hex }}
                      aria-hidden
                    />
                    <div>
                      <p className="font-medium text-[var(--text-main)]">
                        {color.name}{" "}
                        <span className="font-mono text-xs text-[var(--text-muted)]">
                          {color.hex}
                        </span>
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {color.usage}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-6 lg:col-span-2">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-main)]">
                Positioning
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--text-muted)]">
                <li>
                  {SITE_NAME} is community-powered cannabis intel for Michigan —
                  not a pay-to-play dispensary directory.
                </li>
                <li>
                  Members report fire finds, boof alerts, mold warnings, and taxed
                  product on a live tactical map.
                </li>
                <li>
                  Tagline: <strong className="text-[var(--text-main)]">{TAGLINE}</strong>
                </li>
                <li>
                  Free to browse; accounts optional for submitting and confirming
                  reports.
                </li>
              </ul>
            </section>

            <section className="rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] p-6 lg:col-span-2">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-main)]">
                Contact
              </h2>
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                Press and partnership inquiries:{" "}
                <a
                  href={`mailto:${MEDIA_CONTACT_EMAIL}`}
                  className="text-[#39FF88] hover:underline"
                >
                  {MEDIA_CONTACT_EMAIL}
                </a>
              </p>
            </section>
          </div>
        </div>
      </PageTransition>
    </AppShell>
  );
}
