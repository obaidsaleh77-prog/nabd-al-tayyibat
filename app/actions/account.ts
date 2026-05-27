"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { withdrawConsentAction } from "@/app/actions/consent";

export interface AccountActionState {
  error?: string;
  success?: boolean;
}

/** سحب الموافقة وإنهاء الجلسة */
export async function withdrawConsentFromSettingsAction(): Promise<AccountActionState> {
  const result = await withdrawConsentAction();
  if (result.error) return { error: result.error };
  return { success: true };
}

/** حذف الحساب وبياناته نهائياً */
export async function deleteAccountAction(): Promise<AccountActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "غير مصرح" };

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);

    if (error) {
      return { error: "تعذر حذف الحساب. تأكد من إعداد SUPABASE_SERVICE_ROLE_KEY." };
    }

    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
  } catch {
    return {
      error: "حذف الحساب يتطلب SUPABASE_SERVICE_ROLE_KEY في البيئة.",
    };
  }
}
