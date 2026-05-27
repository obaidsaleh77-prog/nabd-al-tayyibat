import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CalendarDays, Utensils, Scale, Target, Sparkles } from "lucide-react";
import { ComplianceGauge } from "@/components/charts/ComplianceGauge";
import { MealForm } from "@/components/forms/MealForm";
import { Card } from "@/components/ui/card";
import { getTodayMeals, getTodayCompliance } from "@/app/actions/meals";
import { formatNumberAr } from "@/lib/utils";
import type { ComplianceSnapshot } from "@/types/database";

const DAYS = ["أحد", "إثن", "ثلاث", "أربع", "خميس", "جمعة", "سبت"];

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
  const today = new Date();
  const todayIndex = today.getDay();
  const todayDate = today.getDate();

  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(todayDate - todayIndex + i);
    return {
      day: DAYS[d.getDay()] ?? "",
      date: d.getDate(),
      active: i === todayIndex,
    };
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-primary">مرحباً بعودتك</p>
          <h1 className="text-2xl font-bold text-text-dark dark:text-white">
            {profile?.full_name || "مستخدم نبض الطيبات"}
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-2 text-primary">
          <CalendarDays className="h-5 w-5" />
          <span className="text-sm font-medium">{today.toLocaleDateString("ar-SA")}</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {calendarDays.map((d) => (
          <button
            key={d.day}
            className={`flex min-w-[72px] flex-col items-center rounded-2xl py-3 px-4 transition-all ${
              d.active
                ? "card-gradient text-white shadow-lg scale-105"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            <span className="text-xs font-medium">{d.day}</span>
            <span className="text-lg font-bold">{d.date}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <ComplianceGauge
            percent={Math.round(percent)}
            snapshot={compliance as ComplianceSnapshot | null}
          />
        </div>
        <div className="md:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-0 bg-white dark:bg-slate-800 shadow-card dark:shadow-card-dark">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-secondary/10 p-3 text-secondary">
                  <Utensils className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-text-light dark:text-slate-400">وجبات اليوم</p>
                  <p className="text-2xl font-bold text-text-dark dark:text-white">{formatNumberAr(meals.length)}</p>
                </div>
              </div>
            </Card>
            <Card className="border-0 bg-white dark:bg-slate-800 shadow-card dark:shadow-card-dark">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-text-light dark:text-slate-400">نسبة الالتزام</p>
                  <p className="text-2xl font-bold text-text-dark dark:text-white">{Math.round(percent)}%</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-4 rounded-2xl card-gradient p-4 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">نصيحة اليوم</span>
            </div>
            <p className="mt-1 text-sm opacity-90">
              حافظ على الفترة 4 ساعات بين الوجبات لتحقيق أقصى استفادة من نظام الطيبات.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <MealForm />
        <Card className="border-0 bg-white dark:bg-slate-800 shadow-card dark:shadow-card-dark">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-text-dark dark:text-white">
            <Utensils className="h-5 w-5 text-primary" />
            وجبات اليوم
          </h2>
          {meals.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 py-8 text-center text-sm text-text-light dark:text-slate-500">
              لم تُسجّل وجبات بعد
            </div>
          ) : (
            <ul className="space-y-3">
              {meals.map((m) => {
                const ingredients = Array.isArray(m.ingredients) ? (m.ingredients as string[]) : [];
                return (
                  <li
                    key={m.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {new Date(m.started_at).toLocaleTimeString("ar-SA", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {m.status === "flagged" ? (
                        <span className="rounded-lg bg-red-100 px-2 py-0.5 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
                          مخالفة
                        </span>
                      ) : (
                        <span className="rounded-lg bg-emerald-100 px-2 py-0.5 text-xs text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                          مقبول
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{ingredients.join("، ")}</p>
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
