import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  Utensils,
  Scale,
  Activity,
  Timer,
  Sparkles,
  ChevronLeft,
  Clock,
  Apple,
  Flame,
  Droplets,
} from "lucide-react";
import { ComplianceGauge } from "@/components/charts/ComplianceGauge";
import { MealForm } from "@/components/forms/MealForm";
import { Card } from "@/components/ui/card";
import { getTodayMeals, getTodayCompliance } from "@/app/actions/meals";
import { formatNumberAr, cn } from "@/lib/utils";
import type { ComplianceSnapshot } from "@/types/database";
import Link from "next/link";

export const metadata: Metadata = { title: "نبض الطيبات" };

/* ثوابت الحركة المتدرجة — كل بطاقة تتأخر 80ms عن التي قبلها */
const stagger = (i: number) => ({
  animationDelay: `${i * 80}ms`,
});

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
  const todayDate = new Intl.DateTimeFormat("ar-SA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const firstName = profile?.full_name?.split(" ")[0] || "مستخدم";

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "منذ لحظات";
    return `منذ ${h} ساعة`;
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* ====== 1. الهيدر — تحية + حلقة الالتزام ====== */}
      <div className="mb-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted tracking-wide">
              {todayDate}
            </p>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              مرحباً، {firstName}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Sparkles className="h-3 w-3 text-primary" />
              <span>كيف صحتك اليوم؟</span>
            </div>
          </div>
          <Link href="/health-status" className="relative flex items-center justify-center">
            <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
              <circle cx="36" cy="36" r="30" fill="none" stroke="#E8ECF0" strokeWidth="5" />
              <circle
                cx="36" cy="36" r="30"
                fill="none" stroke="#03A5EE" strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 30 * (percent / 100)} ${2 * Math.PI * 30 * (1 - percent / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-lg font-bold text-primary">
              {formatNumberAr(Math.round(percent))}%
            </span>
          </Link>
        </div>
      </div>

      {/* ====== 2. شبكة الإحصائيات السريعة (2×2) ====== */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { href: "/meals", label: "وجبات اليوم", value: formatNumberAr(meals.length), icon: Utensils, gradient: "from-secondary/20 to-secondary/5", color: "text-secondary" },
          { href: "/weight", label: "الوزن", value: "تسجيل", icon: Scale, gradient: "from-primary/20 to-primary/5", color: "text-primary" },
          { href: "/health-status", label: "الحالة الصحية", value: "صحتي", icon: Activity, gradient: "from-accent/20 to-accent/5", color: "text-accent" },
          { href: "/rules", label: "الدليل الغذائي", value: "التفاصيل", icon: Timer, gradient: "from-emerald-500/20 to-emerald-500/5", color: "text-emerald-500" },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card
                className="group relative overflow-hidden p-4 transition-all duration-200 active:scale-[0.97] animate-slide-up"
                style={stagger(i)}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} ${item.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">{item.label}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{item.value}</p>
                  </div>
                </div>
                <div className="absolute -bottom-2 -left-2 opacity-[0.04] select-none pointer-events-none">
                  <Icon className="h-16 w-16" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* ====== 3. رسم الالتزام + وجبات اليوم ====== */}
      <div className="grid gap-5 md:grid-cols-2 mb-6">
        <div className="animate-slide-up" style={stagger(4)}>
          <ComplianceGauge
            percent={Math.round(percent)}
            snapshot={compliance as ComplianceSnapshot | null}
          />
        </div>

        <Card className="p-5 animate-slide-up" style={stagger(5)}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Apple className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">وجبات اليوم</h2>
            </div>
            <Link
              href="/meals"
              className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              عرض الكل <ChevronLeft className="h-3 w-3" />
            </Link>
          </div>

          {meals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <Utensils className="h-6 w-6 text-muted" />
              </div>
              <p className="text-sm text-muted">لم تُسجّل وجبات اليوم</p>
              <p className="text-xs text-muted/70 mt-1">أضف أول وجبة الآن</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute right-[17px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-800 rounded-full" />
              <ul className="space-y-0">
                {meals.slice(0, 4).map((m, idx) => {
                  const ingredients = Array.isArray(m.ingredients) ? (m.ingredients as string[]) : [];
                  const isFlagged = m.status === "flagged";
                  return (
                    <li key={m.id} className="relative flex items-start gap-4 pb-4 last:pb-0">
                      <div className={cn(
                        "relative z-10 mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        isFlagged
                          ? "bg-red-50 text-red-500 dark:bg-red-950/30"
                          : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
                      )}>
                        {isFlagged ? "!" : "✓"}
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                            {new Date(m.started_at).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="text-[10px] text-muted/60">{timeAgo(m.started_at)}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5 leading-snug">
                          {ingredients.slice(0, 3).join(" — ")}
                          {ingredients.length > 3 ? "..." : ""}
                        </p>
                        <span className={cn(
                          "inline-block mt-1 rounded-lg px-2 py-0.5 text-[10px] font-bold",
                          isFlagged
                            ? "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400"
                            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                        )}>
                          {isFlagged ? "مخالفة" : "مقبول"}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </Card>
      </div>

      {/* ====== 4. نصيحة اليوم ====== */}
      <Card className="relative overflow-hidden p-5 gradient-health text-white shadow-lg shadow-primary/20 mb-6 animate-slide-up" style={stagger(6)}>
        <div className="absolute -bottom-6 -left-6 opacity-10">
          <Sparkles className="h-32 w-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/20">
              <Flame className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold">نصيحة اليوم</span>
          </div>
          <p className="text-sm leading-relaxed opacity-90">
            حافظ على الفترة 4 ساعات بين الوجبات لتحقيق أقصى استفادة من نظام الطيبات.
            شرب الماء بين الوجبات يساعد في تحسين الهضم وزيادة الشعور بالشبع.
          </p>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-1.5 text-xs opacity-80">
              <Droplets className="h-3 w-3" />
              <span>اشرب 8 أكواب ماء</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs opacity-80">
              <Clock className="h-3 w-3" />
              <span>4 ساعات بين الوجبات</span>
            </div>
          </div>
        </div>
      </Card>

      {/* ====== 5. إضافة وجبة — في الأسفل قريب من الـ Bottom Bar ====== */}
      <Card className="p-5 animate-slide-up" style={stagger(7)}>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
            <Apple className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">إضافة وجبة</h2>
        </div>
        <MealForm />
      </Card>
    </div>
  );
}
