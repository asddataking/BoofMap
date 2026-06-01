import Link from "next/link";
import { Download, Mail } from "lucide-react";
import { BoofLogo } from "./BoofLogo";
import { Disclaimer } from "./Disclaimer";
import { TAGLINE } from "@/lib/constants";
import { MEDIA_CONTACT_EMAIL, MEDIA_KIT_PDF_FILENAME, MEDIA_KIT_PDF_PATH } from "@/lib/media";

const exploreLinks = [
  { href: "/reports", label: "Map & reports" },
  { href: "/brands", label: "Brands" },
  { href: "/report", label: "Report boof" },
] as const;

const helpLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/media", label: "Media kit" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-[var(--border-soft)] pt-10">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <BoofLogo size="sm" showBeta />
          <p className="mt-3 max-w-xs text-sm text-[var(--text-muted)]">
            {TAGLINE} Community-powered cannabis intel for Michigan.
          </p>
          <a
            href={`mailto:${MEDIA_CONTACT_EMAIL}`}
            className="mt-4 inline-flex items-center gap-2 text-sm text-[#39FF88] underline-offset-2 hover:underline"
          >
            <Mail className="h-4 w-4" aria-hidden />
            {MEDIA_CONTACT_EMAIL}
          </a>
        </div>

        <nav aria-label="Explore">
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Explore
          </h2>
          <ul className="mt-3 space-y-2">
            {exploreLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-[var(--text-main)] underline-offset-2 hover:text-[#39FF88] hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Help and resources">
          <h2 className="font-display text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Help
          </h2>
          <ul className="mt-3 space-y-2">
            {helpLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-[var(--text-main)] underline-offset-2 hover:text-[#39FF88] hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={MEDIA_KIT_PDF_PATH}
                download={MEDIA_KIT_PDF_FILENAME}
                className="inline-flex items-center gap-2 text-sm text-[var(--text-main)] underline-offset-2 hover:text-[#39FF88] hover:underline"
              >
                <Download className="h-4 w-4 shrink-0" aria-hidden />
                Download media kit (PDF)
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mt-10 border-t border-[var(--border-soft)] pt-6">
        <Disclaimer />
        <p className="mt-4 text-[11px] text-[var(--text-muted)]">
          © {year} BoofMap. Community intel — not medical or legal advice.
        </p>
      </div>
    </footer>
  );
}
