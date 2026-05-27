/**
 * هذا الملف يحتوي على دوال server-only فقط.
 * لا تستورد هذا الملف في Client Components.
 */
import { createClient } from "@/lib/supabase/server";
import { getRules, validateIngredients, matchOcrText } from "./validator";
import type { TayyibatRules, ValidationSummary } from "./types";

const staticRules = getRules();

/**
 * جلب القواعد ديناميكياً من قاعدة البيانات وتحويلها إلى هيكل TayyibatRules
 * مع استخدام الملف الثابت كـ Fallback في حال حدوث أي خطأ
 */
export async function getDbRules(): Promise<TayyibatRules> {
  try {
    const supabase = await createClient();
    const { data: dbRules, error } = await supabase
      .from("food_rules")
      .select("*");

    if (error || !dbRules || dbRules.length === 0) {
      return staticRules;
    }

    const allowed: Record<string, any> = {};
    const prohibited: Record<string, any> = {};
    const customPenalties: Record<string, number> = {};

    for (const item of dbRules) {
      const catKey = item.category;
      if (item.type === "allowed") {
        if (!allowed[catKey]) {
          allowed[catKey] = {
            name: item.category,
            keywords: [],
            conditions: item.reason || "",
            penalty_on_violation: 0,
            frequency_limit: null,
          };
        }
        allowed[catKey].keywords.push(item.name);
      } else {
        if (!prohibited[catKey]) {
          prohibited[catKey] = {
            name: item.category,
            severity: item.severity || "medium",
            keywords: [],
          };
        }
        prohibited[catKey].keywords.push(item.name);
        if (item.penalty_percent !== null && item.penalty_percent !== undefined) {
          customPenalties[item.name] = Number(item.penalty_percent);
        }
      }
    }

    return {
      version: "db-dynamic",
      allowed,
      prohibited,
      ocr_matching_rules: staticRules.ocr_matching_rules,
      ...({ customPenalties } as any),
    };
  } catch (e) {
    console.error("Error fetching rules from DB, falling back to static:", e);
    return staticRules;
  }
}

/**
 * فحص نص OCR باستخدام القواعد الديناميكية من قاعدة البيانات
 */
export async function validateOcrText(text: string): Promise<ValidationSummary> {
  const dbRules = await getDbRules();
  return matchOcrText(text, dbRules);
}

/**
 * فحص قائمة المكونات باستخدام القواعد الديناميكية من قاعدة البيانات
 */
export async function validateIngredientsFromDb(
  input: string | string[]
): Promise<ValidationSummary> {
  const dbRules = await getDbRules();
  return validateIngredients(input, dbRules);
}
