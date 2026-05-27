import { createBrowserClient } from "@supabase/ssr";

/**
 * عميل Supabase للمتصفح (مكوّنات Client فقط)
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "متغيرات NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY مطلوبة"
    );
  }

  return createBrowserClient(url, key);
}
