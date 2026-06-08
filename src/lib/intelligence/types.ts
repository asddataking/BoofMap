export type ProfileRole = "customer" | "budtender" | "brand";

export type DetectionType = "fire" | "boof" | "value" | "warning";

export type DetectorRank =
  | "observer"
  | "detector"
  | "investigator"
  | "analyst"
  | "chief_analyst";

export type SignalEventType =
  | "fire_trending"
  | "boof_alert"
  | "value_detected"
  | "batch_warning"
  | "ranking_move"
  | "brand_entry"
  | "fake_cart";

export type LeaderboardCategory =
  | "top_fire_products"
  | "top_fire_brands"
  | "top_value_products"
  | "top_flower"
  | "top_pre_rolls"
  | "top_rosin"
  | "top_concentrates";

export type AchievementId =
  | "first_detection"
  | "boof_buster"
  | "fire_finder"
  | "value_hunter"
  | "market_analyst"
  | "top_detector";

export interface Detection {
  id: string;
  type: DetectionType;
  user_id: string;
  product_id?: string | null;
  brand_id?: string | null;
  product_name: string;
  brand_name: string;
  dispensary_name?: string | null;
  city: string;
  state?: string | null;
  confidence_score: number;
  confirmations: number;
  latitude?: number | null;
  longitude?: number | null;
  image_url?: string | null;
  notes?: string | null;
  issue_tags?: string[];
  created_at: string;
}

export interface SignalEvent {
  id: string;
  type: SignalEventType;
  title: string;
  detail?: string | null;
  brand_name?: string | null;
  product_name?: string | null;
  city?: string | null;
  state?: string | null;
  movement?: number | null;
  severity?: string | null;
  created_at: string;
}

export interface MarketStatus {
  state: string;
  fire_reports_rising: boolean;
  new_boof_alerts: number;
  batch_warnings: number;
  fire_trend_pct: number;
  boof_trend_pct: number;
  updated_at: string;
}

export interface IntelligenceStats {
  fire_found: number;
  boof_exposed: number;
  community_savings: number;
  verified_signals: number;
  fire_today: number;
  boof_today: number;
}

export interface LeaderboardSnapshot {
  id: string;
  category: LeaderboardCategory;
  entries: LeaderboardEntry[];
  updated_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  subtitle?: string;
  score: number;
  movement: number;
  slug?: string;
  report_count?: number;
}

export interface MarketReport {
  id: string;
  week_start: string;
  week_end: string;
  state: string;
  most_improved_brand: string;
  most_trusted_brand: string;
  hottest_product: string;
  most_active_city: string;
  best_value_product: string;
  biggest_boof_alert: string;
  published_at: string;
}

export interface UserAchievement {
  id: AchievementId;
  label: string;
  description: string;
  earned_at?: string | null;
}

export interface DetectorProfile {
  user_id: string;
  role: ProfileRole;
  detector_rank: DetectorRank;
  detection_points: number;
  rank_progress: number;
  referral_code: string;
  customers_referred: number;
  budtenders_referred: number;
  active_referrals: number;
  achievements: UserAchievement[];
  display_name?: string | null;
}

export interface IntelligenceNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

export interface PlatformStats {
  reports: number;
  products: number;
  brands: number;
  active_users: number;
}

export interface IntelligenceRankingEntry {
  id: string;
  rank: number;
  product_name: string;
  brand_name: string;
  brand_slug: string;
  product_slug: string;
  score: number;
  previous_score?: number | null;
  movement: number;
  report_count: number;
  price_per_gram?: number | null;
  product_type: string;
}

export interface ProductIntelligenceScore {
  product_name: string;
  brand_name: string;
  community_score: number;
  flavor_score: number;
  burn_score: number;
  value_score: number;
  freshness_score?: number;
  report_count: number;
}
