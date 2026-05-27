import type { Metadata } from "next";
import Link from "next/link";
import { getAdminStats } from "@/app/actions/admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNumberAr } from "@/lib/utils";
import { RefreshCw, Users, Utensils, ClipboardList, TrendingUp, Settings, BookOpen } from "lucide-react";

export const metadata: Metadata = { title: "لوحة الأدمن" };

export default async function AdminPage() {
  const stats = await getAdminStats();

  if (!stats) {
    return <p className="p-8 text-red-600">غير مصرح</p>;
  }

  const statCards = [
    { label: "المستخدمون", value: stats.usersCount, icon: Users, color: "text-primary bg-primary/10" },
    { label: "الوجبات المسجّلة", value: stats.mealsCount, icon: Utensils, color: "text-secondary bg-secondary/10" },
    { label: "قواعد المرجع الغذائي", value: stats.foodRulesCount, icon: ClipboardList, color: "text-emerald-600 bg-emerald-50" },
    { label: "أحداث تحليلية", value: stats.eventsCount, icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-text-dark dark:text-white">لوحة الإدارة</h1>
        <p className="text-sm text-text-light dark:text-slate-400">مرحباً بعودتك، إليك ملخص التطبيق</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-0 bg-white dark:bg-slate-800 shadow-card dark:shadow-card-dark">
              <div className="flex items-center gap-3">
                <div className={`rounded-2xl p-3 ${s.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-text-light dark:text-slate-400">{s.label}</p>
                  <p className="text-2xl font-bold text-text-dark dark:text-white">{formatNumberAr(s.value)}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-800 shadow-card dark:shadow-card-dark p-6">
        <h2 className="mb-4 text-lg font-bold text-text-dark dark:text-white">الإدارة السريعة</h2>
        <p className="mb-5 text-xs text-text-light dark:text-slate-400">نسخة القواعد المحلية (Fallback): {stats.rulesVersion}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/updates">
            <Button className="card-gradient text-white font-bold gap-2 shadow-lg">
              <RefreshCw className="h-4 w-4" />
              التحديثات
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/5">
              <Settings className="h-4 w-4" />
              الإعدادات
            </Button>
          </Link>
          <Link href="/admin/content">
            <Button variant="outline" className="gap-2 border-secondary/30 text-secondary hover:bg-secondary/5">
              <BookOpen className="h-4 w-4" />
              المدونة
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-slate-400">
              العودة للتطبيق
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
