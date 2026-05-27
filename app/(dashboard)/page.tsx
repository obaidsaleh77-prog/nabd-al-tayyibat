import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  Utensils,
  Scale,
  Activity,
  ChevronLeft,
  Timer,
} from "lucide-react";
import { ComplianceGauge } from "@/components/charts/ComplianceGauge";
import { MealForm } from "@/components/forms/MealForm";
import { Card } from "@/components/ui/card";
import { getTodayMeals, getTodayCompliance } from "@/app/actions/meals";
import { formatNumberAr } from "@/lib/utils";
import type { ComplianceSnapshot } from "@/types/database";
import Link from "next/link";

export const metadata: Metadata = { title: "نبض الطيبات" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const [meals, compliance] = await Promise.all([
    getTodayMeals(user.id),
    getTodayCompliance(user.id),
  ]);

  const percent = compliance?.total_percent ?? 0;
  const todayName = new Intl.DateTimeFormat("ar-SA", { weekday: "long" }).format(new Date());
  const todayFull = new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">{todayName}</p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {todayFull}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            مرحباً {profile?.full_name?.split(" ")[0] || "مستخدم"}
          </p>
        </div>
        <div className="flex flex-col items-center">
          <div className="gradient-primary rounded-2xl px-5 py-3 text-white text-center shadow-lg shadow-primary/20">
            <p className="text-xs opacity-80">التزام اليوم</p>
            <p className="text-2xl font-bold leading-tight">{formatNumberAr(Math.round(percent))}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/meals">
          <Card className="p-4 hover:shadow-elevated transition-all duration-200 active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                <Utensils className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted">وجبات اليوم</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{formatNumberAr(meals.length)}</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/weight">
          <Card className="p-4 hover:shadow-elevated transition-all duration-200 active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted">الوزن</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">تسجيل</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/health-status">
          <Card className="p-4 hover:shadow-elevated transition-all duration-200 active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted">الحالة</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">صحتي</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/rules">
          <Card className="p-4 hover:shadow-elevated transition-all duration-200 active:scale-[0.98]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Timer className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted">الدليل</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">الغذائي</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <ComplianceGauge
          percent={Math.round(percent)}
          snapshot={compliance as ComplianceSnapshot | null}
        />
        <div className="space-y-3">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">وجبات اليوم</h2>
              <Link href="/meals" className="text-xs text-primary flex items-center gap-1">
                الكل <ChevronLeft className="h-3 w-3" />
              </Link>
            </div>
            {meals.length === 0 ? (
              <p className="text-sm text-muted py-4 text-center">لم تُسجّل وجبات بعد</p>
            ) : (
              <ul className="space-y-2">
                {meals.slice(0, 4).map((m) => {
                  const ingredients = Array.isArray(m.ingredients) ? (m.ingredients as string[]) : [];
                  return (
                    <li
                      key={m.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted">
                          {new Date(m.started_at).toLocaleTimeString("ar-SA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
                          {ingredients.slice(0, 2).join("، ")}
                          {ingredients.length > 2 ? "..." : ""}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-medium ${
                          m.status === "flagged"
                            ? "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400"
                            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                        }`}
                      >
                        {m.status === "flagged" ? "مخالفة" : "مقبول"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card className="p-4 gradient-primary text-white shadow-lg shadow-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 opacity-80" />
              <span className="text-sm font-medium opacity-90">نصيحة اليوم</span>
            </div>
            <p className="text-sm leading-relaxed opacity-90">
              حافظ على الفترة 4 ساعات بين الوجبات لتحقيق أقصى استفادة من نظام الطيبات.
            </p>
          </Card>
        </div>
      </div>

      <MealForm />
    </div>
  );
}
