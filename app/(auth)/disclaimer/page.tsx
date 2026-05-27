import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasValidConsent } from "@/lib/auth/consent";
import { Card, CardHeader } from "@/components/ui/card";
import { DisclaimerForm } from "@/components/forms/DisclaimerForm";
import { DisclaimerModal } from "@/components/forms/DisclaimerModal";

export const metadata: Metadata = {
  title: "إقرار المسؤولية",
};

export default async function DisclaimerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const consented = await hasValidConsent(user.id);
  if (consented) {
    redirect("/");
  }

  return (
    <>
      {/* صفحة كاملة + مودال شفاف للإقرار */}
      <Card className="w-full max-w-lg border-emerald-200/50 bg-white/90 backdrop-blur-sm dark:border-emerald-800/30 dark:bg-slate-900/90">
        <CardHeader
          title="إقرار وإخلاء مسؤولية"
          description="يجب الموافقة قبل استخدام التطبيق"
        />
        <DisclaimerForm />
      </Card>

      <DisclaimerModal isOpen />
    </>
  );
}
