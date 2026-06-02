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

function envValue(key) {
  return process.env[key]?.trim() ?? "";
}

const missing = required.filter((key) => {
  const value = envValue(key);
  return !value || value.includes("placeholder");
});

const invalid = required
  .filter((key) => !missing.includes(key))
  .flatMap((key) => {
    const value = envValue(key);
    const issues = [];
    if (process.env[key] !== value) {
      issues.push(`${key} has leading/trailing whitespace`);
    }
    if (key === "NEXT_PUBLIC_SITE_URL") {
      if (value === key || value === `$${key}`) {
        issues.push(
          `${key} is set to the variable name — use https://www.boofmap.com`
        );
      } else if (value.includes("boofmaps.com")) {
        issues.push(`${key} should be https://www.boofmap.com (not boofmaps.com)`);
      } else {
        try {
          const parsed = new URL(value);
          if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
            issues.push(`${key} must start with https://`);
          }
        } catch {
          issues.push(`${key} must be a valid URL like https://www.boofmap.com`);
        }
      }
    }
    if (
      key === "NEXT_PUBLIC_CONVEX_URL" &&
      !/^https:\/\/[a-z0-9-]+\.convex\.cloud\/?$/.test(value)
    ) {
      issues.push(`${key} must look like https://your-deployment.convex.cloud`);
    }
    return issues;
  });

if (missing.length > 0) {
  console.error(
    "Production build blocked — set these in Vercel (Production):\n" +
      missing.map((k) => `  - ${k}`).join("\n")
  );
  process.exit(1);
}

if (invalid.length > 0) {
  console.error(
    "Production build blocked — fix these Vercel env values:\n" +
      invalid.map((issue) => `  - ${issue}`).join("\n")
  );
  process.exit(1);
}

console.log("Production env validation passed.");
