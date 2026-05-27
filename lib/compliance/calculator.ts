import type { ViolationSeverity } from "@/lib/rules/types";
import { SEVERITY_PENALTY } from "@/lib/rules/validator";

export interface ComplianceWeights {
  diet: number;
  intervals: number;
  logging: number;
}

export interface ComplianceInput {
  mealsLoggedToday: number;
  expectedMealsPerDay?: number;
  violations: Array<{ severity: ViolationSeverity; penalty?: number }>;
  intervalsCompliant: number;
  intervalsTotal: number;
  intervalBonusMax?: number;
}

export interface ComplianceResult {
  dietScore: number;
  intervalScore: number;
  loggingScore: number;
  totalPercent: number;
  level: "green" | "yellow" | "red";
  breakdown: string[];
}

const DEFAULT_WEIGHTS: ComplianceWeights = {
  diet: 40,
  intervals: 30,
  logging: 30,
};

/** مستوى اللون حسب النسبة */
export function getComplianceLevel(
  percent: number
): "green" | "yellow" | "red" {
  if (percent >= 80) return "green";
  if (percent >= 60) return "yellow";
  return "red";
}

/**
 * معادلة الالتزام:
 * النوع الغذائي (40%) + الفترات (30%) + دقة التسجيل (30%)
 * كل مخالفة تخصم 5–15% حسب الخطورة
 * الالتزام بالفترات يضيف حتى +10%
 */
export function calculateCompliance(
  input: ComplianceInput,
  weights: ComplianceWeights = DEFAULT_WEIGHTS
): ComplianceResult {
  const expected = input.expectedMealsPerDay ?? 3;
  const breakdown: string[] = [];

  // ——— النوع الغذائي ———
  let dietBase = 100;
  for (const v of input.violations) {
    const penalty = v.penalty ?? SEVERITY_PENALTY[v.severity];
    dietBase = Math.max(0, dietBase - penalty);
    breakdown.push(`خصم ${penalty}% — مخالفة (${v.severity})`);
  }
  const dietScore = (dietBase / 100) * weights.diet;

  // ——— الفترات ———
  const intervalRatio =
    input.intervalsTotal > 0
      ? input.intervalsCompliant / input.intervalsTotal
      : 1;
  const bonusMax = input.intervalBonusMax ?? 10;
  const intervalBonus = intervalRatio * bonusMax;
  const intervalRaw = Math.min(100, intervalRatio * 100 + intervalBonus);
  const intervalScore = (intervalRaw / 100) * weights.intervals;
  if (intervalBonus > 0) {
    breakdown.push(`مكافأة فترات: +${intervalBonus.toFixed(1)}%`);
  }

  // ——— دقة التسجيل ———
  const loggingRatio = Math.min(1, input.mealsLoggedToday / expected);
  const loggingScore = loggingRatio * weights.logging;

  const totalPercent = Math.round(
    Math.min(100, Math.max(0, dietScore + intervalScore + loggingScore))
  );

  return {
    dietScore: Math.round(dietScore * 10) / 10,
    intervalScore: Math.round(intervalScore * 10) / 10,
    loggingScore: Math.round(loggingScore * 10) / 10,
    totalPercent,
    level: getComplianceLevel(totalPercent),
    breakdown,
  };
}
