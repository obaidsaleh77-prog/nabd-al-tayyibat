import { createClient } from "@supabase/supabase-js";

/**
 * عميل service role — للعمليات الإدارية فقط (حذف الحساب)
 * لا تستدعِ من Client Components
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY مطلوب لعمليات الحذف الإدارية");
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
