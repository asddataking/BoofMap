import type { IntelligenceRankingEntry, PlatformStats } from "./types";

export const DEMO_PLATFORM_STATS: PlatformStats = {
  reports: 312,
  products: 148,
  brands: 67,
  active_users: 89,
};

export const DEMO_TOP_FLOWER: IntelligenceRankingEntry[] = [
  {
    id: "honey-banana-local-grove",
    rank: 1,
    product_name: "Honey Banana",
    brand_name: "Local Grove",
    brand_slug: "local-grove",
    product_slug: "honey-banana-local-grove",
    score: 4.8,
    previous_score: 4.2,
    movement: 0.6,
    report_count: 12,
    price_per_gram: 28,
    product_type: "flower",
  },
  {
    id: "frosted-kush-peninsula-gardens",
    rank: 2,
    product_name: "Frosted Kush",
    brand_name: "Peninsula Gardens",
    brand_slug: "peninsula-gardens",
    product_slug: "frosted-kush-peninsula-gardens",
    score: 4.6,
    previous_score: 4.4,
    movement: 0.2,
    report_count: 9,
    price_per_gram: 32,
    product_type: "flower",
  },
  {
    id: "garlic-breath-rkive",
    rank: 3,
    product_name: "Garlic Breath",
    brand_name: "RKIVE",
    brand_slug: "rkive",
    product_slug: "garlic-breath-rkive",
    score: 4.5,
    previous_score: 4.1,
    movement: 0.4,
    report_count: 7,
    price_per_gram: 35,
    product_type: "flower",
  },
];

export const DEMO_MOVERS: IntelligenceRankingEntry[] = [
  {
    id: "mochi-runtz-mitten-extracts",
    rank: 1,
    product_name: "Mochi Runtz",
    brand_name: "Mitten Extracts",
    brand_slug: "mitten-extracts",
    product_slug: "mochi-runtz-mitten-extracts",
    score: 4.7,
    movement: 1.2,
    report_count: 5,
    product_type: "flower",
  },
  {
    id: "zaza-jeeter",
    rank: 2,
    product_name: "Zaza",
    brand_name: "Jeeter",
    brand_slug: "jeeter",
    product_slug: "zaza-jeeter",
    score: 4.3,
    movement: 0.9,
    report_count: 4,
    product_type: "pre-roll",
  },
];

export const DEMO_HOT_DROPS: IntelligenceRankingEntry[] = [
  {
    id: "purple-punch-hytek",
    rank: 1,
    product_name: "Purple Punch",
    brand_name: "Hytek",
    brand_slug: "hytek",
    product_slug: "purple-punch-hytek",
    score: 4.2,
    movement: 0.9,
    report_count: 6,
    product_type: "flower",
  },
];

export const DEMO_FALLING_PRODUCTS: IntelligenceRankingEntry[] = [
  {
    id: "midz-jeeter",
    rank: 1,
    product_name: "Midz",
    brand_name: "Jeeter",
    brand_slug: "jeeter",
    product_slug: "midz-jeeter",
    score: 2.8,
    movement: -1.1,
    report_count: 4,
    product_type: "pre-roll",
  },
  {
    id: "garlic-cookies-common-citizen",
    rank: 2,
    product_name: "Garlic Cookies",
    brand_name: "Common Citizen",
    brand_slug: "common-citizen",
    product_slug: "garlic-cookies-common-citizen",
    score: 3.1,
    movement: -0.7,
    report_count: 3,
    product_type: "flower",
  },
];

export const DEMO_VALUE_PICKS: IntelligenceRankingEntry[] = [
  {
    id: "budget-kush-common-citizen",
    rank: 1,
    product_name: "Budget Kush",
    brand_name: "Common Citizen",
    brand_slug: "common-citizen",
    product_slug: "budget-kush-common-citizen",
    score: 4.1,
    movement: 8.5,
    report_count: 8,
    price_per_gram: 18,
    product_type: "flower",
  },
];
