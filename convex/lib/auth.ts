import type { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";
import type { UserIdentity } from "convex/server";

type AuthCtx = QueryCtx | MutationCtx | ActionCtx;

function parseAdminIds(): string[] {
  const raw = process.env.ADMIN_USER_IDS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminIdentity(identity: {
  subject: string;
  email?: string | null;
}): boolean {
  if (parseAdminIds().includes(identity.subject)) return true;
  const email = identity.email?.toLowerCase();
  if (email && parseAdminEmails().includes(email)) return true;
  return false;
}

export async function requireIdentity(ctx: AuthCtx): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}

export async function requireAdmin(ctx: AuthCtx): Promise<UserIdentity> {
  const identity = await requireIdentity(ctx);
  if (!isAdminIdentity(identity)) {
    throw new Error("Unauthorized");
  }
  return identity;
}

export function isAdminUserId(userId: string): boolean {
  return parseAdminIds().includes(userId);
}
