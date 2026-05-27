import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Settings, Shield, User } from "lucide-react";
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
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">الإعدادات</h1>
        <p className="text-sm text-muted">إدارة ملفك الصحي والخصوصية</p>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">الملف الصحي</h2>
        </div>
        <HealthProfileForm profile={profile as UserHealthProfile | null} />
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
            <Shield className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">الخصوصية والموافقة</h2>
        </div>
        <p className="mb-3 text-sm text-muted">
          إصدار الإقرار الحالي: {DISCLAIMER_VERSION}
          {consent?.consented_at
            ? ` — آخر موافقة: ${new Date(consent.consented_at).toLocaleDateString("ar-SA")}`
            : null}
        </p>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          نحفظ بياناتك بشكل آمن وفق سياسة RLS. لا نشارك بياناتك الصحية مع أطراف ثالثة.
          البيانات مشفرة أثناء النقل (HTTPS).
        </p>
        <SettingsActions />
      </Card>
    </div>
  );
}
