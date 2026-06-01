import type { NotificationCategoryId } from "@/lib/constants";

export interface NotificationPreferencesState {
  enabled: boolean;
  state: string;
  categories: NotificationCategoryId[];
  followed_brands: string[];
  followed_products: string[];
  updated_at: number | null;
}

const STORAGE_KEY = "boofmap_notification_prefs";

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferencesState = {
  enabled: false,
  state: "MI",
  categories: ["mold_concern", "fire_drops_near_me", "fraud_watch"],
  followed_brands: [],
  followed_products: [],
  updated_at: null,
};

export function loadLocalNotificationPrefs(): NotificationPreferencesState {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFS;
    return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
}

export function saveLocalNotificationPrefs(prefs: NotificationPreferencesState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...prefs, updated_at: Date.now() })
  );
}
