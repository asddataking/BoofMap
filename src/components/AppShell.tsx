"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Menu, Shield, Target } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { SiteFooter } from "./SiteFooter";
import { BoofLogo } from "./BoofLogo";
import { useAuth } from "@/components/BoofAuthProvider";
import { NotificationBell } from "@/components/intelligence/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { useId, useState } from "react";

const landingLinks = [
  { href: "/reports", label: "Intel Map" },
  { href: "/brands", label: "Brands" },
  { href: "/#how-it-works", label: "How It Works" },
] as const;

const appLinks = [
  { href: "/reports", label: "Intel Map" },
  { href: "/brands", label: "Brands" },
  { href: "/report", label: "Report" },
] as const;

export function AppShell({
  children,
  showFab = false,
  variant = "default",
}: {
  children: React.ReactNode;
  showFab?: boolean;
  variant?: "default" | "landing";
}) {
  const { isAuthenticated, loading, isAdmin } = useAuth();
  const pathname = usePathname();
  const isLanding = variant === "landing";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const navLinks = isLanding ? landingLinks : appLinks;

  return (
    <div
      className={cn(
        "relative min-h-dvh bg-[var(--bg-main)]",
        isLanding
          ? "pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-12"
          : "pb-[calc(5.5rem+env(safe-area-inset-bottom))]"
      )}
    >
      <header className="sticky top-0 z-30 border-b border-[var(--border-soft)] bg-[var(--bg-panel)]/95 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] lg:max-w-none lg:px-8">
          <BoofLogo size="md" />

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Main navigation"
          >
            {navLinks.map(({ href, label }) => {
              const path = href.split("#")[0] || "/";
              const active =
                path === "/"
                  ? pathname === "/" && !href.includes("#")
                  : pathname === path || pathname.startsWith(`${path}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "font-display rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wide transition",
                    active
                      ? "text-[var(--fire-green)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20 sm:inline-flex"
              >
                <Shield className="h-4 w-4" aria-hidden />
                Admin
              </Link>
            )}
            <Link
              href="/report"
              className="btn-dark hidden items-center gap-2 !px-4 !py-2 text-sm sm:inline-flex"
            >
              <Target className="h-4 w-4" aria-hidden />
              Report Boof
            </Link>

            {!loading && (
              <>
                {isAuthenticated ? (
                  <>
                  <NotificationBell />
                  <UserButton
                    appearance={{
                      elements: { avatarBox: "h-9 w-9" },
                    }}
                  />
                  </>
                ) : (
                  <div className="hidden items-center gap-2 sm:flex">
                    <SignInButton mode="modal">
                      <button
                        type="button"
                        className="interactive-muted rounded-xl px-3 py-2 text-sm font-medium"
                      >
                        Sign in
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button type="button" className="btn-primary !px-4 !py-2 text-sm">
                        Sign up
                      </button>
                    </SignUpButton>
                  </div>
                )}
              </>
            )}

            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="interactive-muted rounded-xl p-2 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id={menuId}
            className="border-t border-[var(--border-soft)] px-4 py-3 lg:hidden"
            aria-label="Mobile menu"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map(({ href, label }) => {
                const path = href.split("#")[0] || "/";
                const active =
                  path === "/"
                    ? pathname === "/" && !href.includes("#")
                    : pathname === path || pathname.startsWith(`${path}/`);

                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className="interactive-muted rounded-xl px-3 py-2.5 text-sm font-medium"
                  >
                    {label}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm font-semibold text-amber-300"
                >
                  Admin panel
                </Link>
              )}
              <Link
                href="/report"
                onClick={() => setMenuOpen(false)}
                className="btn-dark mt-1 rounded-xl px-3 py-2.5 text-sm font-semibold"
              >
                Report Boof
              </Link>
              <div className="mt-2 border-t border-[var(--border-soft)] pt-3">
                <ThemeToggle showLabel className="w-full justify-center" />
              </div>
            </div>
          </nav>
        )}
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl px-4 lg:max-w-none lg:px-8"
        tabIndex={-1}
      >
        {children}
      </main>

      {showFab && (
        <Link
          href="/report"
          aria-label="Report boof — contribute product intelligence"
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex min-h-[48px] items-center gap-2 rounded-lg bg-[#FF3B3B] px-5 py-3.5 font-display text-sm font-extrabold uppercase tracking-wide text-white shadow-[0_8px_32px_rgba(255,59,59,0.4)] transition hover:scale-[1.02] hover:shadow-[0_8px_40px_rgba(255,59,59,0.55)] active:scale-[0.98] lg:bottom-8 lg:right-8"
        >
          <Target className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Report Boof</span>
        </Link>
      )}

      <footer
        className={cn(
          "mx-auto w-full max-w-6xl px-4 pt-8 lg:max-w-none lg:px-8",
          isLanding ? "pb-28 lg:pb-8" : "pb-28"
        )}
      >
        <SiteFooter />
      </footer>

      <MobileNav />
    </div>
  );
}
