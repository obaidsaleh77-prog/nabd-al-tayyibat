export type UserRole = "user" | "admin";
export type ConsentAction = "accepted" | "withdrawn";
export type MealLogStatus = "pending" | "confirmed" | "flagged";
export type ViolationSeverity = "low" | "medium" | "high" | "critical";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  locale: string;
  theme: "light" | "dark" | "system";
  created_at: string;
  updated_at: string;
}

export interface UsersConsent {
  id: string;
  user_id: string;
  disclaimer_version: string;
  accepted: boolean;
  action: ConsentAction;
  ip_address: string | null;
  user_agent: string | null;
  consented_at: string;
  withdrawn_at: string | null;
  created_at: string;
}

export interface UserActiveConsent {
  id: string;
  user_id: string;
  disclaimer_version: string;
  accepted: boolean;
  action: ConsentAction;
  consented_at: string;
  withdrawn_at: string | null;
}

export interface UserHealthProfile {
  id: string;
  user_id: string;
  height_cm: number | null;
  baseline_weight_kg: number | null;
  medical_conditions: string[];
  medical_conditions_other: string | null;
  created_at: string;
  updated_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  started_at: string;
  ingredients: string[];
  notes: string | null;
  status: MealLogStatus;
  compliance_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface MealInterval {
  id: string;
  user_id: string;
  previous_meal_id: string | null;
  current_meal_id: string;
  interval_hours: number;
  is_compliant: boolean | null;
  bonus_points: number | null;
  created_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  weight_kg: number;
  logged_at: string;
  is_daily_baseline: boolean;
  notes: string | null;
  created_at: string;
}

export interface ComplianceSnapshot {
  id: string;
  user_id: string;
  snapshot_date: string;
  diet_score: number;
  interval_score: number;
  logging_score: number;
  total_percent: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Violation {
  id: string;
  user_id: string;
  meal_id: string | null;
  ingredient_name: string;
  category: string;
  severity: ViolationSeverity;
  penalty_percent: number;
  detected_at: string;
  source: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: BlogContent;
  hero_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BlogContent {
  sections?: BlogSection[];
  allowedTable?: { category: string; items: string }[];
  prohibitedTable?: { category: string; items: string }[];
  intervalChart?: { label: string; hours: number }[];
}

export interface BlogSection {
  type: "text" | "heading" | "list";
  title?: string;
  body?: string;
  items?: string[];
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export interface FeatureFlag {
  flag_key: string;
  is_enabled: boolean;
  description: string | null;
}

export interface AppSetting {
  key: string;
  value: Record<string, unknown>;
}
