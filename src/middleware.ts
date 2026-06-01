import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Clerk runs on app routes only — not static assets in /public.
 * (.json was missing before, which caused manifest.json → 401.)
 */
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|txt|xml|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
