"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Bell } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuth } from "@/components/BoofAuthProvider";
import { isConvexConfigured } from "@/lib/convex/config";
import { GAMIFICATION_ENABLED } from "@/lib/intelligence/featureFlags";
import { formatTimeAgo } from "@/lib/utils";

const GAMIFICATION_TYPES = new Set([
  "points_earned",
  "rank_up",
  "achievement",
]);

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = useQuery(
    api.intelligenceNotifications.unreadCount,
    isConvexConfigured() && isAuthenticated ? {} : "skip"
  );
  const notifications = useQuery(
    api.intelligenceNotifications.listMine,
    isConvexConfigured() && isAuthenticated ? { limit: 12 } : "skip"
  );
  const markRead = useMutation(api.intelligenceNotifications.markRead);
  const markAllRead = useMutation(api.intelligenceNotifications.markAllRead);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  if (!isAuthenticated || !isConvexConfigured()) return null;

  const filtered =
    notifications?.filter(
      (n) => GAMIFICATION_ENABLED || !GAMIFICATION_TYPES.has(n.type)
    ) ?? [];

  const count = GAMIFICATION_ENABLED
    ? (unread ?? 0)
    : filtered.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
        aria-label={`Notifications${count ? `, ${count} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#39FF88] px-1 text-[10px] font-bold text-[#050807]">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,320px)] overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--bg-card)] shadow-[0_16px_48px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-[var(--border-soft)] px-4 py-3">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
              Intel Alerts
            </span>
            {count > 0 && (
              <button
                type="button"
                onClick={() => markAllRead({})}
                className="text-[10px] font-semibold text-[#39FF88] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <ul className="max-h-80 overflow-y-auto">
            {!filtered.length ? (
              <li className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                No notifications yet
              </li>
            ) : (
              filtered.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!n.read) {
                        markRead({
                          notificationId: n.id as Id<"notifications">,
                        });
                      }
                    }}
                    className={`w-full px-4 py-3 text-left transition hover:bg-[var(--bg-panel)] ${
                      n.read ? "opacity-60" : ""
                    }`}
                  >
                    <p className="text-sm font-semibold text-[var(--text-main)]">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                      {n.body}
                    </p>
                    <p className="mt-1 text-[10px] text-[var(--text-muted)]/70">
                      {formatTimeAgo(n.created_at)}
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
