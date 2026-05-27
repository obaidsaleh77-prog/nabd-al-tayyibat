import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Scale, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { getWeightStats } from "@/app/actions/weight";
import { WeightForm } from "@/components/forms/WeightForm";
import { WeightChart } from "@/components/charts/WeightChart";
import { Card } from "@/components/ui/card";
import { formatNumberAr } from "@/lib/utils";

export const metadata: Metadata = { title: "الوزن" };

export default async function WeightPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const stats = await getWeightStats(user.id);
  const chartData = [...stats.logs]
    .reverse()
    .map((l) => ({ date: l.logged_at, weight: l.weight_kg }));

  const diffCards = [
    { label: "يومي", value: stats.daily, icon: stats.daily != null ? (stats.daily > 0 ? TrendingUp : TrendingDown) : Minus, color: stats.daily != null ? (stats.daily > 0 ? "text-red-500 bg-red-50" : "text-emerald-500 bg-emerald-50") : "text-muted bg-slate-50" },
    { label: "أسبوعي", value: stats.weekly, icon: stats.weekly != null ? (stats.weekly > 0 ? TrendingUp : TrendingDown) : Minus, color: stats.weekly != null ? (stats.weekly > 0 ? "text-red-500 bg-red-50" : "text-emerald-500 bg-emerald-50") : "text-muted bg-slate-50" },
    { label: "شهري", value: stats.monthly, icon: stats.monthly != null ? (stats.monthly > 0 ? TrendingUp : TrendingDown) : Minus, color: stats.monthly != null ? (stats.monthly > 0 ? "text-red-500 bg-red-50" : "text-emerald-500 bg-emerald-50") : "text-muted bg-slate-50" },
  ] as const;

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">وزني اليوم</h1>
        <p className="text-sm text-muted">تابع تغيرات وزنك يومياً</p>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Scale className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">تسجيل وزن جديد</h2>
        </div>
        <WeightForm isDailyBaseline />
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {diffCards.map((d) => {
          const Icon = d.icon as React.ElementType;
          return (
            <Card key={d.label} className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted">الفرق {d.label}</p>
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${d.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {d.value != null ? `${d.value > 0 ? "+" : ""}${formatNumberAr(d.value)} كغ` : "—"}
              </p>
            </Card>
          );
        })}
      </div>

      {chartData.length > 0 ? (
        <Card>
          <h2 className="mb-4 text-base font-bold text-slate-800 dark:text-white">منحنى الوزن</h2>
          <WeightChart data={chartData} />
        </Card>
      ) : null}
    </div>
  );
}
