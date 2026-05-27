import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasValidConsent } from "@/lib/auth/consent";
import { Shield } from "lucide-react";
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
      <Card className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
            <Shield className="h-5 w-5" />
          </div>
        </div>
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
