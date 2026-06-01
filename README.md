# BoofMap

**Find fire. Avoid boof.**

Mobile-first community cannabis quality & value reporting — plus meetup/seller experience reports.

## Tech stack

- Next.js App Router · TypeScript · Tailwind CSS
- **Progressive Web App** (installable, offline shell, service worker)
- **Convex** (database, realtime, server functions)
- **Clerk** (authentication, integrated with Convex JWT)
- **Cloudflare R2** (report images via presigned uploads)
- Leaflet + OpenStreetMap · Framer Motion

BoofMap is a **browser-based PWA** — not a native App Store / Play Store app. Users can add it to their home screen from Safari or Chrome.

## Setup

### 1. Convex

```bash
npm install
npx convex dev
```

Sign in when prompted. This creates your deployment and writes `NEXT_PUBLIC_CONVEX_URL` to `.env.local`.

### 2. Cloudflare R2

1. Create an R2 bucket and enable public access (or custom domain).
2. Create API tokens with read/write on that bucket.
3. In the [Convex dashboard](https://dashboard.convex.dev) → your project → **Settings → Environment variables**, add:

| Variable | Description |
|----------|-------------|
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret |
| `R2_BUCKET_NAME` | Bucket name |
| `R2_PUBLIC_URL` | Public base URL for objects (e.g. `https://pub-xxx.r2.dev`) |

### 3. Clerk + Convex auth

1. Create a [Clerk](https://clerk.com) application and add to `.env.local`:

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

2. In the Clerk Dashboard, **activate the Convex integration** and ensure the JWT template is named exactly `convex`.

3. Copy your Clerk **Frontend API URL** into `.env.local` and the Convex dashboard:

   ```
   CLERK_FRONTEND_API_URL=https://your-app.clerk.accounts.dev
   ```

4. Run `npx convex dev` so `convex/auth.config.ts` syncs to your deployment.

### 4. Admin access

After signing in once, copy your **Clerk user ID** from `/profile` and set:

```
ADMIN_USER_IDS=user_xxxxxxxx
```

Also add `ADMIN_USER_IDS` in the Convex dashboard (same value).

### 5. Run

```bash
npm run dev
```

Runs Next.js and Convex dev servers together.

### 6. Seed demo data (optional)

On an empty database, run once from your machine (not from the public client):

```bash
npx convex run seed:seedDemo
npx convex run seed:seedLiveMvp
```

Add `--prod` for the production deployment. Seed mutations are **internal** — they cannot be called from the browser.

## Production (`www.boofmap.com`)

### Environment files

| File | Purpose |
|------|---------|
| `.env.local.example` | Local dev template (`pk_test_`, dev Convex URL) |
| `.env.example` | Production checklist for Vercel + Convex |

Copy `.env.local.example` → `.env.local` when setting up locally.

### Vercel environment variables

Set these on the **Production** environment in the Vercel project:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://www.boofmap.com` |
| `NEXT_PUBLIC_CONVEX_URL` | Your **production** Convex deployment URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk **production** `pk_live_...` |
| `CLERK_SECRET_KEY` | Clerk **production** `sk_live_...` |
| `CLERK_FRONTEND_API_URL` | Clerk production Frontend API URL (JWT issuer) |
| `ADMIN_USER_IDS` / `ADMIN_EMAILS` | Same as dev |
| `NEXT_PUBLIC_ADMIN_USER_IDS` / `NEXT_PUBLIC_ADMIN_EMAILS` | Optional nav hints (same as dev) |
| `OPENAI_API_KEY` | Required for `/admin` AI chat |

`vercel.json` redirects `boofmap.com` → `www.boofmap.com`. Add **both** hostnames in Vercel → Domains.

Production builds validate required env vars automatically (`scripts/validate-production-env.mjs`).

### Clerk (production instance)

In the Clerk Dashboard for your **production** application:

1. **Domains** → add `https://www.boofmap.com` (and `https://boofmap.com` if listed).
2. **Paths** → set sign-in / sign-up URLs if you use custom paths (defaults are fine).
3. **JWT templates** → keep a template named exactly `convex` (Convex integration).
4. Copy **Frontend API URL** into Vercel `CLERK_FRONTEND_API_URL` and Convex production env as `CLERK_FRONTEND_API_URL`.

Redeploy Vercel after changing env vars. Run `npx convex deploy` for production Convex with matching Clerk vars.

## Local dev without Convex

If `NEXT_PUBLIC_CONVEX_URL` is unset in **local development**, the app uses **local seed data** (no realtime, no uploads). Production (`VERCEL_ENV=production`) never serves seed data — misconfigured Convex env shows empty feeds instead of demo Michigan data.

## Admin dashboard

Visit `/admin` when signed in with a Clerk user ID listed in `ADMIN_USER_IDS`.

## Legal tone

All copy uses community-report language. PII (phones, addresses, legal names, plates) is blocked in Convex mutations.
