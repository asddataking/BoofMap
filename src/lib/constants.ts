import type { MeetupType, ProductType } from "./types";

export const TAGLINE = "Find Fire. Avoid Boof.";

/** Primary brand lockup (header, footer, media). */
export const BOOFMAP_LOGO = {
  src: "/boofmaplogo.png",
  width: 1774,
  height: 887,
  alt: "BoofMap — Find Fire. Avoid Boof. Live cannabis intelligence",
} as const;

export const DISCLAIMER =
  "BoofMap is based on community-submitted reports. Always inspect products yourself and contact the licensed retailer or regulator for serious safety concerns.";

export const MEETUP_DISCLAIMER =
  "Meetup reports are user-submitted experiences, not verified facts. Never share phone numbers, addresses, or legal names. For serious safety concerns, contact local authorities.";

export const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: "flower", label: "Flower" },
  { value: "cart", label: "Cart" },
  { value: "disposable", label: "Disposable" },
  { value: "concentrate", label: "Concentrate" },
  { value: "edible", label: "Edible" },
  { value: "pre-roll", label: "Pre-roll" },
];

export const ISSUE_TAGS = [
  "Mold",
  "Dry",
  "No Flavor",
  "No Smell",
  "Harsh Smoke",
  "Weak High",
  "Seeds/Stems",
  "Bad Trim",
  "Burns Dark",
  "Fake Terp Taste",
  "Old Package Date",
  "Overpriced / Taxed",
  "Fake Sale",
  "Leaking Cart",
  "CRC Garbage",
] as const;

/** Quick-tap flags on the fast report flow — maps to ISSUE_TAGS for the API */
export const BOOF_QUICK_FLAGS = [
  { label: "Dry", issueTag: "Dry" },
  { label: "No Smell", issueTag: "No Smell" },
  { label: "Weak Effects", issueTag: "Weak High" },
  { label: "Harsh", issueTag: "Harsh Smoke" },
  { label: "Mold Concern", issueTag: "Mold" },
  { label: "Bad Trim", issueTag: "Bad Trim" },
  { label: "Seeds", issueTag: "Seeds/Stems" },
  { label: "Burns Dark", issueTag: "Burns Dark" },
  { label: "Overpriced", issueTag: "Overpriced / Taxed" },
  { label: "Fake Terp Taste", issueTag: "Fake Terp Taste" },
] as const;

export const NOTIFICATION_CATEGORY_IDS = [
  "mold_concern",
  "product_i_reported",
  "brands_i_follow",
  "fire_drops_near_me",
  "fraud_watch",
  "statewide_alerts",
] as const;

export type NotificationCategoryId =
  (typeof NOTIFICATION_CATEGORY_IDS)[number];

export const NOTIFICATION_CATEGORIES: {
  id: NotificationCategoryId;
  label: string;
  description: string;
}[] = [
  {
    id: "mold_concern",
    label: "Mold Concern",
    description: "Spikes in mold-related community reports near you",
  },
  {
    id: "product_i_reported",
    label: "Product I Reported",
    description: "Updates when others confirm or dispute your reports",
  },
  {
    id: "brands_i_follow",
    label: "Brands I Follow",
    description: "Movement and new reports on brands you track",
  },
  {
    id: "fire_drops_near_me",
    label: "Fire Drops Near Me",
    description: "High SmokeScore batches trending in your area",
  },
  {
    id: "fraud_watch",
    label: "Fraud Watch",
    description: "Fake sales, taxed product, and scam pattern alerts",
  },
  {
    id: "statewide_alerts",
    label: "Statewide Alerts",
    description: "Major statewide boof or safety trends",
  },
];

export const MEETUP_ISSUE_TAGS = [
  "No Show",
  "Changed Price",
  "Suspected Scam",
  "Unsafe Meetup",
  "Fake Photos",
  "Shorted Product",
  "Bad Communication",
  "Would Not Recommend",
] as const;

export const MEETUP_TYPES: { value: MeetupType; label: string }[] = [
  { value: "in-person", label: "In-person meetup" },
  { value: "delivery", label: "Delivery" },
  { value: "other", label: "Other" },
];

export const PLATFORMS = [
  "Snapchat",
  "Telegram",
  "Instagram",
  "Other app",
  "In-person only",
] as const;

export const FEED_FILTERS = [
  { id: "latest", label: "Latest" },
  { id: "near", label: "Near Me" },
  { id: "mold", label: "Mold" },
  { id: "taxed", label: "Taxed" },
  { id: "no-flavor", label: "No Flavor" },
  { id: "dry", label: "Dry" },
  { id: "weak", label: "Weak High" },
  { id: "fire", label: "Fire" },
  { id: "flower", label: "Flower" },
  { id: "carts", label: "Carts" },
] as const;

export const MEETUP_FEED_FILTERS = [
  { id: "latest", label: "Latest" },
  { id: "near", label: "Near Me" },
  { id: "scam", label: "Scam" },
  { id: "no-show", label: "No Show" },
  { id: "changed-price", label: "Changed Price" },
  { id: "unsafe", label: "Unsafe" },
] as const;

export const MICHIGAN_CENTER = { lat: 42.65, lng: -83.2 };
export const DEFAULT_ZOOM = 8;

export const MARKER_COLORS = {
  boof: "#ef4444",
  taxed: "#f97316",
  mid: "#eab308",
  fire: "#10b981",
  meetup: "#e879f9",
} as const;

export const SELLER_SIGNAL_COLORS = {
  green: "#10b981",
  yellow: "#eab308",
  orange: "#f97316",
  red: "#ef4444",
} as const;

export const SELLER_WARNING_THRESHOLD = 3;

export const CITIES = [
  "Detroit",
  "Hazel Park",
  "Ann Arbor",
  "Ferndale",
  "Warren",
  "Port Huron",
  "Bay City",
] as const;

