import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LiveClock } from "@/components/dashboard/LiveClock";
import { ComplianceGauge } from "@/components/charts/ComplianceGauge";
import { MealForm } from "@/components/forms/MealForm";
import { WeightForm } from "@/components/forms/WeightForm";
import { Card } from "@/components/ui/card";
import { getTodayMeals, getTodayCompliance } from "@/app/actions/meals";
import { hasTodayWeight } from "@/app/actions/weight";
import { formatNumberAr } from "@/lib/utils";
import type { ComplianceSnapshot } from "@/types/database";

export const metadata: Metadata = { title: "لوحة التحكم" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [meals, compliance, needsWeight] = await Promise.all([
    getTodayMeals(user.id),
    getTodayCompliance(user.id),
    hasTodayWeight(user.id),
  ]);

  const percent = compliance?.total_percent ?? 0;
  const showWeightPrompt = !needsWeight && meals.length === 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold">لوحة التحكم</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <LiveClock />
        </div>
        <div className="lg:col-span-1">
          <ComplianceGauge
            percent={Math.round(percent)}
            snapshot={compliance as ComplianceSnapshot | null}
          />
        </div>
        <div className="lg:col-span-1 space-y-4">
          {showWeightPrompt ? (
            <Card className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
              <p className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-200">
                يرجى تسجيل وزن اليوم قبل الوجبة الأولى
              </p>
              <WeightForm isDailyBaseline compact />
            </Card>
          ) : null}
          <Card>
            <p className="text-sm text-slate-500">وجبات اليوم</p>
            <p className="text-2xl font-bold">{formatNumberAr(meals.length)}</p>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MealForm />
        <Card>
          <h2 className="mb-4 text-lg font-bold">وجبات اليوم</h2>
          {meals.length === 0 ? (
            <p className="text-sm text-slate-500">لم تُسجّل وجبات بعد</p>
          ) : (
            <ul className="space-y-3">
              {meals.map((m) => {
                const ingredients = Array.isArray(m.ingredients)
                  ? (m.ingredients as string[])
                  : [];
                return (
                  <li
                    key={m.id}
                    className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                  >
                    <p className="text-sm font-medium">
                      {new Date(m.started_at).toLocaleTimeString("ar-SA", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm text-slate-600">{ingredients.join("، ")}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
