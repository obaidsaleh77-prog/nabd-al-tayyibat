import { createClient } from "@/lib/supabase/server";

/** التحقق من تفعيل ميزة */
export async function isFeatureEnabled(flagKey: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("feature_flags")
    .select("is_enabled")
    .eq("flag_key", flagKey)
    .maybeSingle();

  return data?.is_enabled ?? true;
}

/** كل الأعلام كسجل */
export async function getFeatureFlagsMap(): Promise<Record<string, boolean>> {
  const supabase = await createClient();
  const { data } = await supabase.from("feature_flags").select("flag_key, is_enabled");

  const map: Record<string, boolean> = {};
  for (const row of data ?? []) {
    map[row.flag_key] = row.is_enabled;
  }
  return map;
}

export async function getAppSetting<T extends Record<string, unknown>>(
  key: string,
  fallback: T
): Promise<T> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (data?.value && typeof data.value === "object") {
    return { ...fallback, ...(data.value as T) };
  }
  return fallback;
}
