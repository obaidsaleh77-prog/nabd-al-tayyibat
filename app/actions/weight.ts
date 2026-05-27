"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const weightSchema = z.object({
  weightKg: z.coerce.number().min(20).max(500),
  loggedAt: z.string().optional(),
  isDailyBaseline: z.coerce.boolean().optional(),
  notes: z.string().optional(),
});

export interface WeightActionState {
  error?: string;
  success?: boolean;
}

export async function logWeightAction(
  _prev: WeightActionState,
  formData: FormData
): Promise<WeightActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "يجب تسجيل الدخول" };

  const parsed = weightSchema.safeParse({
    weightKg: formData.get("weightKg"),
    loggedAt: formData.get("loggedAt") || undefined,
    isDailyBaseline: formData.get("isDailyBaseline") === "true",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "وزن غير صالح" };
  }

  const loggedAt =
    parsed.data.loggedAt?.slice(0, 10) ??
    new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from("weight_logs").upsert(
    {
      user_id: user.id,
      weight_kg: parsed.data.weightKg,
      logged_at: loggedAt,
      is_daily_baseline: parsed.data.isDailyBaseline ?? false,
      notes: parsed.data.notes || null,
    },
    { onConflict: "user_id,logged_at,is_daily_baseline" }
  );

  if (error) {
    return { error: "تعذر حفظ الوزن" };
  }

  revalidatePath("/");
  revalidatePath("/weight");
  revalidatePath("/health-status");

  return { success: true };
}

export async function getWeightStats(userId: string) {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", userId)
    .order("logged_at", { ascending: false })
    .limit(90);

  if (!logs?.length) {
    return { logs: [], daily: null, weekly: null, monthly: null };
  }

  const today = logs.find(
    (l) => l.logged_at === new Date().toISOString().slice(0, 10)
  );
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const weekLog = logs.find((l) => new Date(l.logged_at) <= weekAgo);
  const monthLog = logs.find((l) => new Date(l.logged_at) <= monthAgo);

  const current = today?.weight_kg ?? logs[0]?.weight_kg;

  return {
    logs,
    daily: today && logs[1] ? today.weight_kg - logs[1].weight_kg : null,
    weekly: current && weekLog ? current - weekLog.weight_kg : null,
    monthly: current && monthLog ? current - monthLog.weight_kg : null,
    todayWeight: today?.weight_kg ?? null,
  };
}

export async function hasTodayWeight(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("weight_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("logged_at", today)
    .maybeSingle();
  return Boolean(data);
}
