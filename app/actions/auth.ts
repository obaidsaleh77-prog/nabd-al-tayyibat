"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hasValidConsent } from "@/lib/auth/consent";
import type { AuthFormState } from "@/types";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل"),
});

const registerSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z
    .string()
    .min(8, "كلمة المرور 8 أحرف على الأقل")
    .regex(/[A-Za-z]/, "يجب أن تحتوي على حرف واحد على الأقل")
    .regex(/[0-9]/, "يجب أن تحتوي على رقم واحد على الأقل"),
  fullName: z.string().min(2, "الاسم قصير جداً").max(100).optional(),
});

/**
 * تسجيل الدخول بالبريد وكلمة المرور
 */
export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message;
    return { error: firstError ?? "بيانات غير صالحة" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return { error: mapAuthError(error.message) };
    }

    if (!data.user) {
      return { error: "فشل تسجيل الدخول" };
    }

    const consented = await hasValidConsent(data.user.id);
    revalidatePath("/", "layout");

    if (!consented) {
      redirect("/disclaimer");
    }

    redirect("/");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: "حدث خطأ غير متوقع. حاول مرة أخرى." };
  }
}

/**
 * إنشاء حساب جديد — يتطلب تأكيد OTP عبر البريد (إعداد Supabase)
 */
export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName") || undefined,
  });

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message;
    return { error: firstError ?? "بيانات غير صالحة" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.fullName ?? "",
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/disclaimer`,
      },
    });

    if (error) {
      return { error: mapAuthError(error.message) };
    }

    if (data.user && !data.session) {
      return {
        success:
          "تم إرسال رمز التحقق (OTP) إلى بريدك. أدخل الرمز في صفحة تسجيل الدخول أو افتح الرابط المرسل.",
      };
    }

    redirect("/disclaimer");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: "حدث خطأ غير متوقع. حاول مرة أخرى." };
  }
}

/**
 * التحقق من رمز OTP بعد التسجيل
 */
export async function verifyOtpAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = formData.get("email");
  const token = formData.get("token");

  if (typeof email !== "string" || typeof token !== "string") {
    return { error: "البريد والرمز مطلوبان" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) {
      return { error: mapAuthError(error.message) };
    }

    if (!data.user) {
      return { error: "فشل التحقق من الرمز" };
    }

    redirect("/disclaimer");
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: "رمز التحقق غير صالح أو منتهي الصلاحية" };
  }
}

/**
 * تسجيل الخروج
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

function mapAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "البريد أو كلمة المرور غير صحيحة";
  }
  if (message.includes("User already registered")) {
    return "هذا البريد مسجّل مسبقاً";
  }
  if (message.includes("Email not confirmed")) {
    return "يرجى تأكيد بريدك عبر رمز OTP المرسل";
  }
  return message;
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
