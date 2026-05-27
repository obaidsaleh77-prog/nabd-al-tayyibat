import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasValidConsent } from "@/lib/auth/consent";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
};

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const consented = await hasValidConsent(user.id);
    redirect(consented ? "/" : "/disclaimer");
  }

  return <LoginForm />;
}
