import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireIdentity } from "./lib/auth";

export const listMine = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user_created", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(limit ?? 30);

    return rows.map((n) => ({
      id: n._id as string,
      type: n.type,
      title: n.title,
      body: n.body,
      read: n.read,
      created_at: new Date(n.createdAt).toISOString(),
    }));
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", identity.subject).eq("read", false)
      )
      .collect();

    return rows.length;
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    const identity = await requireIdentity(ctx);
    const note = await ctx.db.get(notificationId);
    if (!note || note.userId !== identity.subject) {
      return { error: "Not found" };
    }
    await ctx.db.patch(notificationId, { read: true });
    return { ok: true };
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const rows = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", identity.subject).eq("read", false)
      )
      .collect();

    for (const row of rows) {
      await ctx.db.patch(row._id, { read: true });
    }
    return { ok: true, count: rows.length };
  },
});
