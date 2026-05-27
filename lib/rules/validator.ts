import rulesJson from "./tayyibat_rules.json";
import { fuzzyContains, tokenizeIngredients } from "./search";
import { normalizeArabic } from "./normalize";
import type {
  IngredientMatchResult,
  TayyibatRules,
  ValidationSummary,
  ViolationSeverity,
} from "./types";

const staticRules = rulesJson as TayyibatRules;

export const SEVERITY_PENALTY: Record<ViolationSeverity, number> = {
  low: 5,
  medium: 10,
  high: 12,
  critical: 15,
};

export function getRules(): TayyibatRules {
  return staticRules;
}


function matchIngredient(
  ingredient: string,
  rulesToUse: TayyibatRules = staticRules
): IngredientMatchResult {
  const threshold = rulesToUse.ocr_matching_rules.fuzzy_match_threshold;
  const normalized = normalizeArabic(
    ingredient,
    rulesToUse.ocr_matching_rules.ignore_diacritics
  );

  let bestProhibited: IngredientMatchResult | null = null;
  const customPenalties = (rulesToUse as any).customPenalties || {};

  for (const [key, cat] of Object.entries(rulesToUse.prohibited)) {
    for (const keyword of cat.keywords) {
      const { match, confidence } = fuzzyContains(
        normalized,
        keyword,
        threshold
      );
      if (match && (!bestProhibited || confidence > bestProhibited.confidence)) {
        const penalty = customPenalties[keyword] ?? SEVERITY_PENALTY[cat.severity];
        bestProhibited = {
          ingredient,
          status: "prohibited",
          category: key,
          categoryName: cat.name,
          severity: cat.severity,
          penalty: penalty,
          confidence,
          matchedKeyword: keyword,
        };
      }
    }
  }

  if (bestProhibited) return bestProhibited;

  let bestAllowed: IngredientMatchResult | null = null;

  for (const [key, cat] of Object.entries(rulesToUse.allowed)) {
    for (const keyword of cat.keywords) {
      const { match, confidence } = fuzzyContains(
        normalized,
        keyword,
        threshold
      );
      if (match && (!bestAllowed || confidence > bestAllowed.confidence)) {
        bestAllowed = {
          ingredient,
          status: "allowed",
          category: key,
          categoryName: cat.name,
          confidence,
          matchedKeyword: keyword,
        };
      }
    }
  }

  if (bestAllowed) return bestAllowed;

  return {
    ingredient,
    status: "unclear",
    confidence: 0,
  };
}

/** التحقق من قائمة مكونات أو نص */
export function validateIngredients(
  input: string | string[],
  customRules?: TayyibatRules
): ValidationSummary {
  const rulesToUse = customRules || staticRules;
  const items = Array.isArray(input) ? input : tokenizeIngredients(input);
  const violations: IngredientMatchResult[] = [];
  const allowed: IngredientMatchResult[] = [];
  const unclear: IngredientMatchResult[] = [];

  for (const item of items) {
    const result = matchIngredient(item, rulesToUse);
    if (result.status === "prohibited") violations.push(result);
    else if (result.status === "allowed") allowed.push(result);
    else unclear.push(result);
  }

  const totalPenalty = violations.reduce((sum, v) => sum + (v.penalty ?? 0), 0);

  return { violations, allowed, unclear, totalPenalty };
}

/** مطابقة نص OCR كامل */
export function matchOcrText(
  text: string,
  customRules?: TayyibatRules
): ValidationSummary {
  return validateIngredients(text, customRules);
}
