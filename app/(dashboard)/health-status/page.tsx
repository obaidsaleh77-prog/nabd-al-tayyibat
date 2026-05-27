import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
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
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">الحالة الصحية</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-lg font-bold">منحنى الوزن</h2>
          <WeightChart data={data.weightChart} />
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-bold">مؤشر الالتزام الزمني</h2>
          <ComplianceTimeline data={data.complianceChart} />
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-bold">ملخص المخالفات</h2>
        {data.violations.length === 0 ? (
          <p className="text-sm text-slate-500">لا توجد مخالفات في آخر 30 يوماً</p>
        ) : (
          <ul className="space-y-2">
            {data.violations.map((v) => (
              <li
                key={v.id}
                className="flex justify-between rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm dark:border-red-900 dark:bg-red-950/30"
              >
                <span>{v.ingredient_name} — {v.category}</span>
                <span className="text-red-600">
                  {formatDateAr(new Date(v.detected_at), { dateStyle: "short" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-bold">توصيات آلية</h2>
        <ul className="list-disc space-y-2 mr-5 text-sm text-slate-700 dark:text-slate-300">
          {data.recommendations.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
