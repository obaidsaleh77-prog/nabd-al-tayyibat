"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { validateIngredients } from "@/lib/rules/validator";
import { getDbRules } from "@/lib/rules/validator.server";
import { calculateCompliance } from "@/lib/compliance/calculator";
import { getAppSetting } from "@/lib/features";
import type { ViolationSeverity } from "@/lib/rules/types";

const mealSchema = z.object({
  startedAt: z.string().min(1),
  ingredients: z.string().min(1, "أدخل مكوناً واحداً على الأقل"),
  notes: z.string().optional(),
});

const MIN_INTERVAL_HOURS = 4;

export interface MealActionState {
  error?: string;
  success?: boolean;
}

async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** إضافة وجبة + حساب الفترات والمخالفات والالتزام */
export async function addMealAction(
  _prev: MealActionState,
  formData: FormData
): Promise<MealActionState> {
  const userId = await getUserId();
  if (!userId) return { error: "يجب تسجيل الدخول" };

  const parsed = mealSchema.safeParse({
    startedAt: formData.get("startedAt"),
    ingredients: formData.get("ingredients"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "بيانات غير صالحة" };
  }

  const ingredientList = parsed.data.ingredients
    .split(/[,،\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const dbRules = await getDbRules();
  const validation = validateIngredients(ingredientList, dbRules);
  const supabase = await createClient();

  const { data: meal, error: mealError } = await supabase
    .from("meals")
    .insert({
      user_id: userId,
      started_at: parsed.data.startedAt,
      ingredients: ingredientList,
      notes: parsed.data.notes || null,
      status: validation.violations.length > 0 ? "flagged" : "confirmed",
    })
    .select("id, started_at")
    .single();

  if (mealError || !meal) {
    return { error: "تعذر حفظ الوجبة" };
  }

  for (const v of validation.violations) {
    await supabase.from("violations").insert({
      user_id: userId,
      meal_id: meal.id,
      ingredient_name: v.ingredient,
      category: v.category ?? "unknown",
      severity: (v.severity ?? "medium") as ViolationSeverity,
      penalty_percent: v.penalty ?? 10,
      source: "rules",
    });
  }

  const dayStart = new Date(meal.started_at);
  dayStart.setHours(0, 0, 0, 0);

  const { data: prevMeals } = await supabase
    .from("meals")
    .select("id, started_at")
    .eq("user_id", userId)
    .lt("started_at", meal.started_at)
    .gte("started_at", dayStart.toISOString())
    .order("started_at", { ascending: false })
    .limit(1);

  const prev = prevMeals?.[0];
  if (prev) {
    const hours =
      (new Date(meal.started_at).getTime() - new Date(prev.started_at).getTime()) /
      (1000 * 60 * 60);
    const isCompliant = hours >= MIN_INTERVAL_HOURS;

    await supabase.from("meal_intervals").insert({
      user_id: userId,
      previous_meal_id: prev.id,
      current_meal_id: meal.id,
      interval_hours: Math.round(hours * 100) / 100,
      is_compliant: isCompliant,
      bonus_points: isCompliant ? Math.min(10, (hours - MIN_INTERVAL_HOURS) * 2) : 0,
    });
  }

  await refreshDailyCompliance(userId);

  revalidatePath("/");
  revalidatePath("/meals");
  revalidatePath("/health-status");

  return { success: true };
}

/** تحديث لقطة الالتزام اليومية */
export async function refreshDailyCompliance(userId: string): Promise<void> {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  const { data: meals } = await supabase
    .from("meals")
    .select("id")
    .eq("user_id", userId)
    .gte("started_at", today.toISOString())
    .lte("started_at", todayEnd.toISOString());

  const { data: violations } = await supabase
    .from("violations")
    .select("severity, penalty_percent")
    .eq("user_id", userId)
    .gte("detected_at", today.toISOString());

  const { data: intervals } = await supabase
    .from("meal_intervals")
    .select("is_compliant")
    .eq("user_id", userId)
    .gte("created_at", today.toISOString());

  const weights = await getAppSetting("compliance_weights", {
    diet: 40,
    intervals: 30,
    logging: 30,
  });

  const intervalList = intervals ?? [];
  const compliantCount = intervalList.filter((i) => i.is_compliant).length;

  const result = calculateCompliance(
    {
      mealsLoggedToday: meals?.length ?? 0,
      violations: (violations ?? []).map((v) => ({
        severity: v.severity as ViolationSeverity,
        penalty: v.penalty_percent,
      })),
      intervalsCompliant: compliantCount,
      intervalsTotal: intervalList.length || 1,
    },
    weights
  );

  const dateStr = today.toISOString().slice(0, 10);

  await supabase.from("compliance_snapshots").upsert(
    {
      user_id: userId,
      snapshot_date: dateStr,
      diet_score: result.dietScore,
      interval_score: result.intervalScore,
      logging_score: result.loggingScore,
      total_percent: result.totalPercent,
      metadata: { breakdown: result.breakdown, level: result.level },
    },
    { onConflict: "user_id,snapshot_date" }
  );
}

export async function getTodayMeals(userId: string) {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { data } = await supabase
    .from("meals")
    .select("*")
    .eq("user_id", userId)
    .gte("started_at", today.toISOString())
    .order("started_at", { ascending: true });
  return data ?? [];
}

export async function getTodayCompliance(userId: string) {
  const supabase = await createClient();
  const dateStr = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("compliance_snapshots")
    .select("*")
    .eq("user_id", userId)
    .eq("snapshot_date", dateStr)
    .maybeSingle();
  return data;
}
