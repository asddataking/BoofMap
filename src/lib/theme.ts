export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "boofmap-theme";

export const THEME_COLORS: Record<Theme, string> = {
  light: "#fafafa",
  dark: "#050807",
};

export function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark";
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : "light";
  } catch {
    return "light";
  }
}
