import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Activity, AlertTriangle, Lightbulb } from "lucide-react";
import { getHealthDashboardData } from "@/app/actions/health";
import { WeightChart } from "@/components/charts/WeightChart";
import { ComplianceTimeline } from "@/components/charts/ComplianceTimeline";
import { Card } from "@/components/ui/card";
import { formatDateAr } from "@/lib/utils";

export const metadata: Metadata = { title: "الحالة الصحية" };

export default async function HealthStatusPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const data = await getHealthDashboardData(user.id);

  return (
    <div className="mx-auto max-w-4xl space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">الحالة الصحية</h1>
        <p className="text-sm text-muted">ملخص أدائك وتوصيات مخصصة</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4">منحنى الوزن</h2>
          <WeightChart data={data.weightChart} />
        </Card>
        <Card>
          <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4">مؤشر الالتزام</h2>
          <ComplianceTimeline data={data.complianceChart} />
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">ملخص المخالفات</h2>
        </div>
        {data.violations.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">لا توجد مخالفات في آخر 30 يوماً</p>
        ) : (
          <ul className="space-y-2">
            {data.violations.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3 text-sm dark:bg-red-950/20"
              >
                <span className="text-slate-700 dark:text-slate-300">
                  {v.ingredient_name} — {v.category}
                </span>
                <span className="text-xs text-red-500">
                  {formatDateAr(new Date(v.detected_at), { dateStyle: "short" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">توصيات آلية</h2>
        </div>
        {data.recommendations.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">لا توجد توصيات حالياً</p>
        ) : (
          <ul className="space-y-3">
            {data.recommendations.map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
