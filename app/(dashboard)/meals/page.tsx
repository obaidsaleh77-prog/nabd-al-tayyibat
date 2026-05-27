import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Utensils } from "lucide-react";
import { MealForm } from "@/components/forms/MealForm";
import { Card } from "@/components/ui/card";
import { formatDateAr } from "@/lib/utils";

export const metadata: Metadata = { title: "الوجبات" };

export default async function MealsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: meals } = await supabase
    .from("meals")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(30);

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">تتبع الوجبات</h1>
        <p className="text-sm text-muted">سجل وجباتك وتابع التزامك بنظام الطيبات</p>
      </div>

      <MealForm />

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Utensils className="h-4 w-4 text-primary" />
          <h2 className="text-base font-bold text-slate-800 dark:text-white">سجل الوجبات</h2>
        </div>
        {!meals?.length ? (
          <p className="text-sm text-muted py-6 text-center">لا توجد وجبات مسجّلة</p>
        ) : (
          <ul className="space-y-3">
            {meals.map((m) => {
              const ingredients = Array.isArray(m.ingredients) ? (m.ingredients as string[]) : [];
              return (
                <li
                  key={m.id}
                  className="flex items-start justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted">
                      {formatDateAr(new Date(m.started_at), { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{ingredients.join("، ")}</p>
                    {m.notes ? <p className="mt-1 text-xs text-muted">{m.notes}</p> : null}
                  </div>
                  <span
                    className={`shrink-0 mr-3 rounded-lg px-2.5 py-1 text-[11px] font-medium ${
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
    </div>
  );
}
