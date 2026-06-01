/**
 * Generate square PWA / favicon assets from public/boofmaplogo.png
 * Run: npm run generate:pwa-icons
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const source = path.join(root, "public", "boofmaplogo.png");
const iconsDir = path.join(root, "public", "icons");
const appDir = path.join(root, "src", "app");

const BG = { r: 5, g: 8, b: 7, alpha: 1 };

async function squareIcon(size, paddingRatio, outPath) {
  const padding = Math.round(size * paddingRatio);
  const inner = size - padding * 2;

  const logo = await sharp(source)
    .resize({
      width: inner,
      height: inner,
      fit: "contain",
      background: BG,
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log("Wrote", path.relative(root, outPath));
}

async function writeSvg() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#050807"/>
  <image href="/boofmaplogo.png" x="24" y="80" width="464" height="232" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;
  const out = path.join(iconsDir, "icon.svg");
  fs.writeFileSync(out, svg);
  console.log("Wrote", path.relative(root, out));
}

async function main() {
  if (!fs.existsSync(source)) {
    console.error("Missing", source);
    process.exit(1);
  }
  fs.mkdirSync(iconsDir, { recursive: true });
  fs.mkdirSync(appDir, { recursive: true });

  await squareIcon(192, 0.08, path.join(iconsDir, "icon-192.png"));
  await squareIcon(512, 0.08, path.join(iconsDir, "icon-512.png"));
  await squareIcon(512, 0.14, path.join(iconsDir, "icon-512-maskable.png"));
  await squareIcon(180, 0.08, path.join(root, "public", "apple-touch-icon.png"));
  await squareIcon(32, 0.1, path.join(iconsDir, "favicon-32.png"));
  await squareIcon(16, 0.1, path.join(iconsDir, "favicon-16.png"));

  await sharp(path.join(iconsDir, "icon-512.png")).toFile(
    path.join(appDir, "icon.png")
  );
  await sharp(path.join(root, "public", "apple-touch-icon.png")).toFile(
    path.join(appDir, "apple-icon.png")
  );
  console.log("Wrote src/app/icon.png and apple-icon.png");

  await writeSvg();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
