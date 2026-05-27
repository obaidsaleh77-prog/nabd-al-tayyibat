import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getHealthProfile } from "@/app/actions/profile";
import { HealthProfileForm } from "@/components/forms/HealthProfileForm";
import { SettingsActions } from "@/components/forms/SettingsActions";
import { Card } from "@/components/ui/card";
import { DISCLAIMER_VERSION } from "@/lib/constants";
import type { UserHealthProfile } from "@/types/database";

export const metadata: Metadata = { title: "الإعدادات" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await getHealthProfile(user.id);

  const { data: consent } = await supabase
    .from("users_consent")
    .select("disclaimer_version, consented_at, accepted")
    .eq("user_id", user.id)
    .order("consented_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">الإعدادات</h1>

      <HealthProfileForm profile={profile as UserHealthProfile | null} />

      <Card>
        <h2 className="mb-2 text-lg font-bold">الخصوصية والموافقة</h2>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          إصدار الإقرار الحالي: {DISCLAIMER_VERSION}
          {consent?.consented_at
            ? ` — آخر موافقة: ${new Date(consent.consented_at).toLocaleDateString("ar-SA")}`
            : null}
        </p>
        <div className="prose prose-sm mb-4 text-slate-600 dark:prose-invert">
          <p>
            نحفظ بياناتك بشكل آمن وفق سياسة RLS. لا نشارك بياناتك الصحية مع أطراف
            ثالثة. البيانات مشفرة أثناء النقل (HTTPS).
          </p>
        </div>
        <SettingsActions />
      </Card>
    </div>
  );
}
