import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">وزني اليوم</h1>

      <Card>
        <h2 className="mb-4 text-lg font-bold">تسجيل وزن جديد</h2>
        <WeightForm isDailyBaseline />
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-slate-500">فرق يومي</p>
          <p className="text-xl font-bold">
            {stats.daily != null ? `${formatNumberAr(stats.daily)} كغ` : "—"}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">فرق أسبوعي</p>
          <p className="text-xl font-bold">
            {stats.weekly != null ? `${formatNumberAr(stats.weekly)} كغ` : "—"}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">فرق شهري</p>
          <p className="text-xl font-bold">
            {stats.monthly != null ? `${formatNumberAr(stats.monthly)} كغ` : "—"}
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-bold">منحنى الوزن</h2>
        <WeightChart data={chartData} />
      </Card>
    </div>
  );
}
