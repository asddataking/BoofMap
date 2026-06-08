"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  className,
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const label = isLight ? "Dark mode" : "Light mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "theme-toggle inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)] px-3 text-[var(--text-main)] shadow-[var(--card-shadow)] transition hover:bg-[var(--surface-hover)] active:scale-95",
        showLabel ? "w-full" : "w-10",
        className
      )}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={label}
    >
      {isLight ? (
        <Moon className="h-4 w-4 shrink-0" aria-hidden />
      ) : (
        <Sun className="h-4 w-4 shrink-0" aria-hidden />
      )}
      {showLabel ? (
        <span className="text-sm font-medium">{label}</span>
      ) : null}
    </button>
  );
}

/** Floating toggle for pages without AppShell chrome. */
export function FloatingThemeToggle() {
  return (
    <ThemeToggle className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 z-[60] lg:bottom-6 sm:hidden" />
  );
}
