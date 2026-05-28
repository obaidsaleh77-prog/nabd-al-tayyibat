"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import rulesJson from "@/lib/rules/tayyibat_rules.json";

export interface AdminActionState {
  error?: string;
  success?: boolean;
}

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

export async function updateComplianceWeightsAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const diet = Number(formData.get("diet"));
  const intervals = Number(formData.get("intervals"));
  const logging = Number(formData.get("logging"));

  if (diet + intervals + logging !== 100) {
    return { error: "مجموع الأوزان يجب أن يساوي 100" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("app_settings").upsert({
    key: "compliance_weights",
    value: { diet, intervals, logging },
    updated_by: auth.userId,
  });

  if (error) return { error: "تعذر الحفظ" };

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function toggleFeatureFlagAction(
  flagKey: string,
  enabled: boolean
): Promise<AdminActionState> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("feature_flags")
    .update({ is_enabled: enabled, updated_by: auth.userId })
    .eq("flag_key", flagKey);

  if (error) return { error: "تعذر التحديث" };

  revalidatePath("/admin/settings");
  return { success: true };
}

const blogSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  excerpt: z.string().optional(),
  content: z.string(),
  isPublished: z.coerce.boolean(),
});

export async function saveBlogPostAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  let content: Record<string, unknown> = {};
  try {
    const raw = String(formData.get("content") || "{}");
    content = JSON.parse(raw) as Record<string, unknown>;
    // Ensure content is always an object (not a string, array, etc.)
    if (typeof content !== "object" || content === null || Array.isArray(content)) {
      content = {};
    }
  } catch {
    return { error: "محتوى JSON غير صالح" };
  }

  const parsed = blogSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    excerpt: formData.get("excerpt") || undefined,
    content: JSON.stringify(content),
    isPublished: formData.get("isPublished") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "بيانات غير صالحة" };
  }

  const supabase = await createClient();
  const postId = formData.get("id");

  const payload = {
    slug: parsed.data.slug,
    title: parsed.data.title,
    excerpt: parsed.data.excerpt || null,
    content,
    is_published: parsed.data.isPublished,
    published_at: parsed.data.isPublished ? new Date().toISOString() : null,
    author_id: auth.userId,
  };

  const { error } = postId
    ? await supabase.from("blog_posts").update(payload).eq("id", String(postId))
    : await supabase.from("blog_posts").insert(payload);

  if (error) return { error: "تعذر حفظ المقال" };

  revalidatePath("/blog");
  revalidatePath("/admin/content");
  return { success: true };
}

export async function deleteBlogPostAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const id = formData.get("id");
  if (!id || typeof id !== "string") return { error: "معرّف المقال مطلوب" };

  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);

  if (error) return { error: "تعذر حذف المقال" };

  revalidatePath("/blog");
  revalidatePath("/admin/content");
  return { success: true };
}

export async function toggleBlogPublishAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  const id = formData.get("id");
  const published = formData.get("published") === "true";

  if (!id || typeof id !== "string") return { error: "معرّف المقال مطلوب" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({
      is_published: published,
      published_at: published ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) return { error: "تعذر تحديث النشر" };

  revalidatePath("/blog");
  revalidatePath("/admin/content");
  return { success: true };
}

export async function saveRulesVersionAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const auth = await requireAdmin();
  if ("error" in auth) return { error: auth.error };

  let rules: Record<string, unknown>;
  try {
    rules = JSON.parse(String(formData.get("rulesJson"))) as Record<string, unknown>;
  } catch {
    return { error: "JSON القواعد غير صالح" };
  }

  const supabase = await createClient();
  await supabase.from("rules_versions").update({ is_active: false }).eq("is_active", true);

  const { error } = await supabase.from("rules_versions").insert({
    version_label: String(formData.get("versionLabel") || "manual"),
    rules_json: rules,
    is_active: true,
    created_by: auth.userId,
  });

  if (error) return { error: "تعذر حفظ القواعد" };

  revalidatePath("/admin/settings");
  return { success: true };
}

export async function getAdminStats() {
  const auth = await requireAdmin();
  if ("error" in auth) return null;

  const supabase = await createClient();

  const [users, meals, events, foodRules] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("meals").select("id", { count: "exact", head: true }),
    supabase.from("analytics_events").select("event_type", { count: "exact", head: true }),
    supabase.from("food_rules").select("id", { count: "exact", head: true }),
  ]);

  return {
    usersCount: users.count ?? 0,
    mealsCount: meals.count ?? 0,
    eventsCount: events.count ?? 0,
    foodRulesCount: foodRules.count ?? 0,
    rulesVersion: (rulesJson as { version: string }).version,
  };
}

export async function getAdminSettings() {
  const supabase = await createClient();
  const [settings, flags] = await Promise.all([
    supabase.from("app_settings").select("*"),
    supabase.from("feature_flags").select("*").order("flag_key"),
  ]);
  return { settings: settings.data ?? [], flags: flags.data ?? [] };
}

export async function getAdminBlogPosts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .order("sort_order", { ascending: true });
  return data ?? [];
}
