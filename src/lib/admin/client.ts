/** Client-side admin hint for nav/UI (Convex still enforces server-side). */
export function isClientAdmin(
  clerkUserId: string | undefined,
  email: string | undefined
): boolean {
  const ids = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const emailRaw =
    process.env.NEXT_PUBLIC_ADMIN_EMAILS ??
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ??
    "";
  const emails = emailRaw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (clerkUserId && ids.includes(clerkUserId)) return true;
  const normalized = email?.toLowerCase();
  if (normalized && emails.includes(normalized)) return true;
  return false;
}
