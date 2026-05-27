import { createClient } from "@/lib/supabase/server";
import type { UserActiveConsent } from "@/types";

/**
 * التحقق من وجود موافقة فعّالة للمستخدم الحالي
 */
export async function getActiveConsent(
  userId: string
): Promise<UserActiveConsent | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users_consent")
    .select("id, user_id, disclaimer_version, accepted, action, consented_at, withdrawn_at")
    .eq("user_id", userId)
    .order("consented_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as UserActiveConsent;
}

/** هل لدى المستخدم موافقة سارية؟ */
export async function hasValidConsent(userId: string): Promise<boolean> {
  const consent = await getActiveConsent(userId);
  if (!consent) return false;
  return consent.accepted === true && consent.action === "accepted";
}
