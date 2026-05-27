"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const optionalNumber = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
    z.number().min(min).max(max).optional()
  );

const profileSchema = z.object({
  heightCm: optionalNumber(50, 250),
  baselineWeightKg: optionalNumber(20, 500),
  medicalConditions: z.array(z.string()).optional(),
  medicalConditionsOther: z.string().max(500).optional(),
});

export interface ProfileActionState {
  error?: string;
  success?: boolean;
}

export async function saveHealthProfileAction(
  _prev: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "يجب تسجيل الدخول" };

  const conditions = formData.getAll("medicalConditions").map(String);
  const heightRaw = formData.get("heightCm");
  const weightRaw = formData.get("baselineWeightKg");

  const parsed = profileSchema.safeParse({
    heightCm: heightRaw === "" ? undefined : heightRaw,
    baselineWeightKg: weightRaw === "" ? undefined : weightRaw,
    medicalConditions: conditions,
    medicalConditionsOther: formData.get("medicalConditionsOther") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "بيانات غير صالحة" };
  }

  const { error } = await supabase.from("user_profiles").upsert(
    {
      user_id: user.id,
      height_cm: parsed.data.heightCm || null,
      baseline_weight_kg: parsed.data.baselineWeightKg || null,
      medical_conditions: parsed.data.medicalConditions ?? [],
      medical_conditions_other: parsed.data.medicalConditionsOther || null,
    },
    { onConflict: "user_id" }
  );

  if (error) return { error: "تعذر حفظ الملف الصحي" };

  revalidatePath("/settings");
  return { success: true };
}

export async function getHealthProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}
