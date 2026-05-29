import { mutation, query } from "./_generated/server";
import { isAdminIdentity, requireIdentity } from "./lib/auth";

export const syncCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const clerkId = identity.subject;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    const displayName =
      identity.name ??
      identity.nickname ??
      identity.email?.split("@")[0] ??
      undefined;
    const role = isAdminIdentity(identity) ? "admin" : "user";

    if (existing) {
      if (displayName && displayName !== existing.displayName) {
        await ctx.db.patch(existing._id, { displayName });
      }
      if (existing.role !== role && role === "admin") {
        await ctx.db.patch(existing._id, { role });
      }
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId,
      displayName,
      role,
      reputation: 0,
      reportCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    return {
      uid: user.clerkId,
      display_name: user.displayName,
      role: user.role,
      reputation: user.reputation,
      report_count: user.reportCount,
    };
  },
});
