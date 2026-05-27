import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasValidConsent } from "@/lib/auth/consent";
import { RegisterForm } from "@/components/forms/RegisterForm";

export const metadata: Metadata = {
  title: "إنشاء حساب",
};

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const consented = await hasValidConsent(user.id);
    redirect(consented ? "/" : "/disclaimer");
  }

  return <RegisterForm />;
}
