import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
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
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">تتبع الوجبات</h1>
      <MealForm />

      <Card>
        <h2 className="mb-4 text-lg font-bold">سجل الوجبات</h2>
        {!meals?.length ? (
          <p className="text-sm text-slate-500">لا توجد وجبات مسجّلة</p>
        ) : (
          <ul className="space-y-4">
            {meals.map((m) => {
              const ingredients = Array.isArray(m.ingredients)
                ? (m.ingredients as string[])
                : [];
              return (
                <li
                  key={m.id}
                  className="border-b border-slate-100 pb-4 last:border-0 dark:border-slate-800"
                >
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {formatDateAr(new Date(m.started_at), {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    <span
                      className={
                        m.status === "flagged"
                          ? "text-red-600"
                          : "text-emerald-600"
                      }
                    >
                      {m.status === "flagged" ? "مخالفة" : "مؤكدة"}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600">{ingredients.join("، ")}</p>
                  {m.notes ? <p className="mt-1 text-xs text-slate-500">{m.notes}</p> : null}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
