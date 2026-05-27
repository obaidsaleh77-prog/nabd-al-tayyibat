"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getDbRules, validateOcrText } from "@/lib/rules/validator.server";
import { matchOcrText } from "@/lib/rules/validator";
import type { AdminActionState } from "./admin";
import type { ValidationSummary } from "@/lib/rules/types";

// Schema for validating a food rule form submission
const ruleSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  name: z.string().min(1, "الاسم مطلوب"),
  type: z.enum(["allowed", "prohibited"], {
    errorMap: () => ({ message: "النوع غير صالح" }),
  }),
  category: z.string().min(1, "التصنيف مطلوب"),
  reason: z.string().optional().nullable(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional().nullable(),
  penaltyPercent: z.coerce.number().min(0).max(100).optional().nullable(),
});

/**
 * دالة مساعدة للتحقق من صلاحية الأدمن
 */
async function requireAdmin(): Promise<{ userId: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "صلاحيات أدمن مطلوبة" };

  return { userId: user.id };
}

/**
 * جلب جميع القواعد من قاعدة البيانات
 */
export async function getFoodRulesAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("food_rules")
    .select("*")
    .order("type", { ascending: true })
    .order("category", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching rules:", error);
    return [];
  }
  return data ?? [];
}

/**
 * إضافة أو تعديل قاعدة غذائية (أدمن فقط)
 */
export async function saveFoodRuleAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const rawId = formData.get("id");
  const parsed = ruleSchema.safeParse({
    id: rawId ? String(rawId) : null,
    name: String(formData.get("name") || "").trim(),
    type: formData.get("type"),
    category: String(formData.get("category") || "").trim(),
    reason: formData.get("reason") ? String(formData.get("reason")).trim() : null,
    severity: formData.get("severity") ? String(formData.get("severity")) : null,
    penaltyPercent: formData.get("penaltyPercent") ? Number(formData.get("penaltyPercent")) : null,
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "بيانات غير صالحة" };
  }

  const supabase = await createClient();
  const ruleId = parsed.data.id;

  const payload = {
    name: parsed.data.name,
    type: parsed.data.type,
    category: parsed.data.category,
    reason: parsed.data.reason,
    severity: parsed.data.type === "prohibited" ? (parsed.data.severity || "medium") : null,
    penalty_percent: parsed.data.type === "prohibited" ? (parsed.data.penaltyPercent ?? 10) : null,
    updated_at: new Date().toISOString(),
  };

  let error;
  if (ruleId) {
    const { error: err } = await supabase
      .from("food_rules")
      .update(payload)
      .eq("id", ruleId);
    error = err;
  } else {
    const { error: err } = await supabase
      .from("food_rules")
      .insert(payload);
    error = err;
  }

  if (error) {
    console.error("Error saving food rule:", error);
    if (error.message.includes("duplicate key")) {
      return { error: "هذا الاسم/الكلمة المفتاحية موجودة مسبقاً" };
    }
    return { error: "تعذر حفظ القاعدة" };
  }

  revalidatePath("/admin/rules");
  revalidatePath("/rules");
  return { success: true };
}

/**
 * حذف قاعدة غذائية (أدمن فقط)
 */
export async function deleteFoodRuleAction(id: string): Promise<AdminActionState> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("food_rules")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting rule:", error);
    return { error: "تعذر حذف القاعدة" };
  }

  revalidatePath("/admin/rules");
  revalidatePath("/rules");
  return { success: true };
}

/**
 * فحص النص المدخل أو نصوص OCR كاملاً باستخدام القواعد الديناميكية بقاعدة البيانات
 */
export async function validateOcrTextAction(text: string): Promise<ValidationSummary> {
  try {
    return await validateOcrText(text);
  } catch (e) {
    console.error("Error in validateOcrTextAction:", e);
    // Fallback to static rules
    return matchOcrText(text);
  }
}
