export type ViolationSeverity = "low" | "medium" | "high" | "critical";

export interface AllowedCategory {
  name: string;
  keywords: string[];
  conditions: string;
  penalty_on_violation: number;
  frequency_limit: string | null;
}

export interface ProhibitedCategory {
  name: string;
  severity: ViolationSeverity;
  keywords: string[];
}

export interface TayyibatRules {
  version: string;
  allowed: Record<string, AllowedCategory>;
  prohibited: Record<string, ProhibitedCategory>;
  ocr_matching_rules: {
    fuzzy_match_threshold: number;
    arabic_normalization: boolean;
    ignore_diacritics: boolean;
  };
}

export type MatchStatus = "allowed" | "prohibited" | "unclear";

export interface IngredientMatchResult {
  ingredient: string;
  status: MatchStatus;
  category?: string;
  categoryName?: string;
  severity?: ViolationSeverity;
  penalty?: number;
  confidence: number;
  matchedKeyword?: string;
}

export interface ValidationSummary {
  violations: IngredientMatchResult[];
  allowed: IngredientMatchResult[];
  unclear: IngredientMatchResult[];
  totalPenalty: number;
}
