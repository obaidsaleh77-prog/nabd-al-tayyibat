"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { DISCLAIMER_VERSION } from "@/lib/constants";
import { getClientIp } from "@/lib/utils";
import type { ConsentFormState } from "@/types";

const acceptSchema = z.object({
  accepted: z.literal("true", {
    errorMap: () => ({ message: "يجب الموافقة على الإقرار للمتابعة" }),
  }),
});

/**
 * تسجيل موافقة المستخدم على إخلاء المسؤولية
 */
export async function acceptDisclaimerAction(
  _prevState: ConsentFormState,
  formData: FormData
): Promise<ConsentFormState> {
  const parsed = acceptSchema.safeParse({
    accepted: formData.get("accepted"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "الموافقة مطلوبة" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect("/login");
    }

    const headersList = await headers();
    const ip = getClientIp(headersList);
    const userAgent = headersList.get("user-agent");

    const { error: insertError } = await supabase.from("users_consent").insert({
      user_id: user.id,
      disclaimer_version: DISCLAIMER_VERSION,
      accepted: true,
      action: "accepted",
      ip_address: ip,
      user_agent: userAgent,
    });

    if (insertError) {
      console.error("Error inserting consent to database:", insertError);
      return { error: `تعذر حفظ الموافقة: ${insertError.message}` };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: "حدث خطأ غير متوقع" };
  }
}

/**
 * سحب الموافقة — يُستخدم لاحقاً من الإعدادات
 */
export async function withdrawConsentAction(): Promise<ConsentFormState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "يجب تسجيل الدخول أولاً" };
    }

    const { error: insertError } = await supabase.from("users_consent").insert({
      user_id: user.id,
      disclaimer_version: DISCLAIMER_VERSION,
      accepted: false,
      action: "withdrawn",
      withdrawn_at: new Date().toISOString(),
    });

    if (insertError) {
      return { error: "تعذر سحب الموافقة" };
    }

    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: "حدث خطأ غير متوقع" };
  }
}

/** التحقق من الموافقة وإعادة التوجيه إن لزم */
export async function requireConsent(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("users_consent")
    .select("accepted, action")
    .eq("user_id", user.id)
    .order("consented_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasConsent =
    data?.accepted === true && data?.action === "accepted";

  if (!hasConsent) {
    redirect("/disclaimer");
  }
}

function isRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest?: string }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
