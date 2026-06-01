/**
 * Generates public/media/boofmap-media-kit.pdf
 * Run: node scripts/generate-media-kit.mjs
 */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "media");
const outFile = path.join(outDir, "boofmap-media-kit.pdf");

const lines = [
  "BOOFMAP MEDIA KIT",
  "",
  "Find Fire. Avoid Boof.",
  "",
  "BoofMap is Michigan's community-powered cannabis intel platform.",
  "Live map, boof alerts, fire finds, and real buyer reports.",
  "",
  "POSITIONING",
  "- Community intel, not pay-to-play listings",
  "- Alternative to menu-only apps like Weedmaps",
  "- Free to browse; accounts for submitting reports",
  "",
  "BRAND COLORS",
  "Fire Green  #39FF88  — primary, fire finds",
  "Boof Red    #FF3B3B  — boof alerts",
  "Draft Green #9AC434  — solid intel",
  "Background  #050807  — app background",
  "",
  "WEB & ASSETS",
  "Website: https://boofmap.com (set NEXT_PUBLIC_SITE_URL in production)",
  "Logo PNG: /boofmaplogo.png",
  "",
  "PRESS CONTACT",
  "press@boofmap.com",
  "",
  "© BoofMap — Community-submitted reports. Not medical or legal advice.",
];

async function main() {
  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const titleFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await doc.embedFont(StandardFonts.Helvetica);

  let y = 740;
  for (const line of lines) {
    const isTitle = line === "BOOFMAP MEDIA KIT";
    const isSection =
      line === "POSITIONING" ||
      line === "BRAND COLORS" ||
      line === "WEB & ASSETS" ||
      line === "PRESS CONTACT";

    const font = isTitle || isSection ? titleFont : bodyFont;
    const size = isTitle ? 22 : isSection ? 12 : 11;
    const color =
      isTitle ? rgb(0.22, 1, 0.53) : rgb(0.9, 0.9, 0.9);

    if (line === "") {
      y -= 10;
      continue;
    }

    page.drawText(line, {
      x: 48,
      y,
      size,
      font,
      color,
      maxWidth: 516,
    });
    y -= size + (isTitle ? 16 : isSection ? 12 : 14);
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, await doc.save());
  console.log("Wrote", outFile);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
