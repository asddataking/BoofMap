import { THEME_STORAGE_KEY } from "@/lib/theme";

/** Runs before paint to avoid a flash of the wrong theme. */
export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");document.documentElement.setAttribute("data-theme",t==="dark"?"dark":"light");}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
