/**
 * Fail Vercel production builds when required env vars are missing.
 * Skips local builds and preview deployments.
 */
if (process.env.SKIP_ENV_VALIDATION === "1") {
  process.exit(0);
}

const isVercelProduction = process.env.VERCEL_ENV === "production";

if (!isVercelProduction) {
  process.exit(0);
}

const required = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_CONVEX_URL",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_SECRET_KEY",
  "CLERK_FRONTEND_API_URL",
];

const missing = required.filter((key) => {
  const value = process.env[key]?.trim();
  return !value || value.includes("placeholder");
});

if (missing.length > 0) {
  console.error(
    "Production build blocked — set these in Vercel (Production):\n" +
      missing.map((k) => `  - ${k}`).join("\n")
  );
  process.exit(1);
}

console.log("Production env validation passed.");
