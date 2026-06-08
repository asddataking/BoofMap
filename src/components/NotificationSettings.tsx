"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Bell, BellOff, BellRing, ShieldAlert } from "lucide-react";
import { api } from "../../convex/_generated/api";
import {
  NOTIFICATION_CATEGORIES,
  type NotificationCategoryId,
} from "@/lib/constants";
import { isConvexConfigured } from "@/lib/convex/config";
import { cn } from "@/lib/utils";
import { useAuth } from "./BoofAuthProvider";
import { SignInPrompt } from "./SignInPrompt";
import {
  DEFAULT_NOTIFICATION_PREFS,
  loadLocalNotificationPrefs,
  saveLocalNotificationPrefs,
  type NotificationPreferencesState,
} from "@/lib/data/notificationFallback";

type AlertStatus = "enabled" | "disabled" | "permission_needed";

function getBrowserPermission(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

function deriveStatus(
  prefsEnabled: boolean,
  permission: NotificationPermission | "unsupported"
): AlertStatus {
  if (!prefsEnabled) return "disabled";
  if (permission === "granted") return "enabled";
  if (permission === "denied" || permission === "default") {
    return "permission_needed";
  }
  return prefsEnabled ? "enabled" : "disabled";
}

const STATUS_STYLES: Record<
  AlertStatus,
  { label: string; className: string; icon: typeof Bell }
> = {
  enabled: {
    label: "Enabled",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    icon: BellRing,
  },
  disabled: {
    label: "Disabled",
    className: "bg-[var(--bg-elevated)]/80 text-[var(--text-muted)] border-[var(--border-soft)]",
    icon: BellOff,
  },
  permission_needed: {
    label: "Permission Needed",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    icon: ShieldAlert,
  },
};

export function NotificationSettings({ compact = false }: { compact?: boolean }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const convexOn = isConvexConfigured();
  const serverPrefs = useQuery(
    api.notifications.getPreferences,
    convexOn && isAuthenticated ? {} : "skip"
  );
  const updatePrefs = useMutation(api.notifications.updatePreferences);

  const [localPrefs, setLocalPrefs] = useState<NotificationPreferencesState>(
    DEFAULT_NOTIFICATION_PREFS
  );
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setPermission(getBrowserPermission());
    if (!convexOn) {
      setLocalPrefs(loadLocalNotificationPrefs());
    }
  }, [convexOn]);

  const prefs = useMemo((): NotificationPreferencesState => {
    if (convexOn && serverPrefs) {
      return {
        enabled: serverPrefs.enabled,
        state: serverPrefs.state ?? "MI",
        categories: serverPrefs.categories as NotificationCategoryId[],
        followed_brands: serverPrefs.followed_brands,
        followed_products: serverPrefs.followed_products,
        updated_at: serverPrefs.updated_at,
      };
    }
    return localPrefs;
  }, [convexOn, serverPrefs, localPrefs]);

  const status = deriveStatus(prefs.enabled, permission);
  const StatusIcon = STATUS_STYLES[status].icon;

  const persist = useCallback(
    async (next: NotificationPreferencesState) => {
      setSaving(true);
      setMessage(null);
      try {
        if (convexOn && isAuthenticated) {
          await updatePrefs({
            enabled: next.enabled,
            state: next.state,
            categories: next.categories,
            followedBrands: next.followed_brands,
            followedProducts: next.followed_products,
          });
        } else {
          saveLocalNotificationPrefs(next);
          setLocalPrefs(next);
        }
        setMessage("Preferences saved");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Could not save");
      } finally {
        setSaving(false);
      }
    },
    [convexOn, isAuthenticated, updatePrefs]
  );

  const toggleMaster = async () => {
    const nextEnabled = !prefs.enabled;
    if (nextEnabled && permission !== "granted" && "Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
    }
    const next = { ...prefs, enabled: nextEnabled };
    if (!convexOn) setLocalPrefs(next);
    await persist(next);
  };

  const toggleCategory = async (id: NotificationCategoryId) => {
    const categories = prefs.categories.includes(id)
      ? prefs.categories.filter((c) => c !== id)
      : [...prefs.categories, id];
    const next = { ...prefs, categories };
    if (!convexOn) setLocalPrefs(next);
    await persist(next);
  };

  const requestPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted" && !prefs.enabled) {
      const next = { ...prefs, enabled: true };
      if (!convexOn) setLocalPrefs(next);
      await persist(next);
    }
  };

  if (authLoading) {
    return (
      <p className="py-6 text-center text-sm text-[var(--text-muted)]">Loading alerts…</p>
    );
  }

  if (!isAuthenticated) {
    return (
      <SignInPrompt message="Sign in to enable Boof Alerts and save your preferences." />
    );
  }

  return (
    <div
      id="boof-alerts"
      className={cn("space-y-4", compact && "space-y-3")}
    >
      <div
        className={cn(
          "glass-card overflow-hidden",
          compact ? "p-4" : "p-5"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
              <Bell className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold text-white">
                Enable Boof Alerts
              </h3>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Community-powered alerts for mold, fire drops, and fraud patterns.
              </p>
            </div>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              STATUS_STYLES[status].className
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {STATUS_STYLES[status].label}
          </span>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={prefs.enabled}
          onClick={() => void toggleMaster()}
          disabled={saving}
          className={cn(
            "mt-4 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition",
            prefs.enabled
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-[var(--border-soft)] bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:border-[var(--border-soft)]"
          )}
        >
          <span>Boof Alerts master switch</span>
          <span
            className={cn(
              "relative h-6 w-11 rounded-full transition",
              prefs.enabled ? "bg-emerald-500" : "bg-[var(--bg-elevated)]"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                prefs.enabled ? "left-[22px]" : "left-0.5"
              )}
            />
          </span>
        </button>

        {status === "permission_needed" && (
          <button
            type="button"
            onClick={() => void requestPermission()}
            className="mt-3 w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-200 hover:border-amber-500/50"
          >
            Allow browser notifications
          </button>
        )}

        {/* TODO: Register FCM token and store VAPID subscription in Convex */}
        {/* TODO: Wire listPotentialAlerts to Web Push delivery worker */}
        <p className="mt-3 text-[10px] text-[var(--text-muted)]">
          Push delivery via FCM / Web Push VAPID coming soon — preferences are
          saved now.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          Alert categories
        </p>
        <div className="grid gap-2">
          {NOTIFICATION_CATEGORIES.map((cat) => {
            const active = prefs.categories.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => void toggleCategory(cat.id)}
                disabled={saving || !prefs.enabled}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition disabled:opacity-40",
                  active
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-[var(--border-soft)] bg-[var(--bg-elevated)] hover:border-[var(--border-soft)]"
                )}
              >
                <span className="text-sm font-medium text-white">
                  {cat.label}
                </span>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">{cat.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {message && (
        <p className="text-center text-xs text-emerald-400/90">{message}</p>
      )}
    </div>
  );
}
