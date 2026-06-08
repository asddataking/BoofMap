export type ProductType =
  | "flower"
  | "cart"
  | "disposable"
  | "concentrate"
  | "edible"
  | "pre-roll";

export type MarkerTier = "boof" | "taxed" | "mid" | "fire";
export type ReportStatus = "pending" | "approved" | "rejected" | "flagged";
export type SellerSignal = "green" | "yellow" | "orange" | "red";
export type MeetupType = "in-person" | "delivery" | "other";

export interface Report {
  id: string;
  user_id?: string | null;
  product_type: ProductType;
  brand_name: string;
  dispensary_name: string;
  city: string;
  strain_name: string;
  price_paid?: number | null;
  package_date?: string | null;
  issue_tags: string[];
  boof_score: number;
  notes?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  confirm_count?: number;
  downvote_count?: number;
  created_at: string;
  image_url?: string | null;
  status?: ReportStatus;
}

export interface MeetupReport {
  id: string;
  user_id?: string | null;
  seller_display_name: string;
  platform: string;
  city: string;
  area?: string | null;
  meetup_type: MeetupType;
  issue_tags: string[];
  seller_signal: SellerSignal;
  notes?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  confirm_count?: number;
  created_at: string;
  image_url?: string | null;
  status?: ReportStatus;
  public_warning?: string | null;
}

export interface ModerationQueueItem {
  id: string;
  source_type: "report" | "meetupReport";
  source_id: string;
  reasons: string[];
  status: "pending" | "approved" | "rejected";
  preview_text?: string;
  image_url?: string | null;
  created_at: string;
}

export interface BrandProfile {
  id: string;
  name: string;
  slug: string;
  trust_score: number;
  avg_boof_score: number;
  report_count: number;
  mold_report_count: number;
  top_complaint?: string;
  product_breakdown: Record<string, number>;
  recent_reports: Report[];
}

export interface DispensaryProfile {
  id: string;
  name: string;
  slug: string;
  city: string;
  value_score: number;
  taxed_alert_count: number;
  avg_reported_price: number;
  report_count: number;
  recent_reports: Report[];
  fire_finds: Report[];
  sentiment: "positive" | "mixed" | "negative";
}

export interface AppStats {
  boofReports: number;
  disposRated: number;
  brandsReviewed: number;
  taxedAlerts: number;
  meetupReports?: number;
}

export interface ReportFormData {
  product_type: ProductType;
  brand_name: string;
  dispensary_name: string;
  city: string;
  strain_name: string;
  price_paid: string;
  package_date: string;
  issue_tags: string[];
  boof_score: number;
  notes: string;
  latitude?: number;
  longitude?: number;
  image_file?: File | null;
}

export interface MeetupReportFormData {
  seller_display_name: string;
  platform: string;
  city: string;
  area: string;
  meetup_type: MeetupType;
  issue_tags: string[];
  notes: string;
  latitude?: number;
  longitude?: number;
  image_file?: File | null;
}

export type ProfileRole = "customer" | "budtender" | "brand";

export type DetectionType = "fire" | "boof" | "value" | "warning";

export interface BoofUser {
  uid: string;
  display_name?: string;
  role: "user" | "admin";
  reputation: number;
  report_count: number;
}

export type TickerItemType =
  | "alert"
  | "fire"
  | "ranking"
  | "warning"
  | "fresh_drop";

export interface TickerItem {
  id: string;
  title: string;
  type: TickerItemType;
  state?: string | null;
  city?: string | null;
  product_name?: string | null;
  brand_name?: string | null;
  severity?: string | null;
  created_at: string;
  expires_at?: string | null;
  is_active?: boolean;
}

export type RankingType =
  | "fire_right_now"
  | "biggest_fallers"
  | "most_reported"
  | "budget_bargers"
  | "fraud_watch";

export interface RankingEntry {
  id: string;
  rank: number;
  name: string;
  subtitle?: string;
  score: number;
  change?: number;
  report_count?: number;
  slug?: string;
  kind: "brand" | "dispensary" | "strain" | "product";
  trend?: string;
}

export interface UserProfile {
  user_id: string;
  display_name?: string | null;
  role_title: string;
  level: number;
  points: number;
  report_count: number;
  streak_count: number;
  accuracy_score?: number | null;
  badges: string[];
  updated_at: string;
}

export interface MarketMover {
  id: string;
  name: string;
  subtitle: string;
  score: number;
  change: number;
  slug?: string;
  kind: "brand" | "dispensary";
}

export interface AlertPreviewSettings {
  boof_alerts: boolean;
  taxed_alerts: boolean;
  fire_finds: boolean;
  meetup_warnings: boolean;
  city: string;
}
