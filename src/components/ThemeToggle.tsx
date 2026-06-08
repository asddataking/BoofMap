"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 z-[60] flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[var(--bg-card)] text-[var(--text-main)] shadow-[var(--card-shadow)] transition hover:bg-[var(--surface-hover)] active:scale-95 lg:bottom-6"
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Dark mode" : "Light mode"}
    >
      {isLight ? (
        <Moon className="h-4 w-4" aria-hidden />
      ) : (
        <Sun className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
