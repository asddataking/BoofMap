import { BOOFMAP_LOGO } from "./constants";

export const MEDIA_KIT_PDF_PATH = "/media/boofmap-media-kit.pdf";
export const MEDIA_LOGO_PATH = BOOFMAP_LOGO.src;
export const MEDIA_KIT_PDF_FILENAME = "boofmap-media-kit.pdf";

export const BRAND_COLORS = [
  { name: "Fire Green", hex: "#39FF88", usage: "Primary CTA, fire finds, live signals" },
  { name: "Boof Red", hex: "#FF3B3B", usage: "Boof alerts, warnings" },
  { name: "Draft Green", hex: "#9AC434", usage: "Solid intel, secondary accent" },
  { name: "Background", hex: "#050807", usage: "App background" },
] as const;

export const MEDIA_CONTACT_EMAIL = "press@boofmap.com";
