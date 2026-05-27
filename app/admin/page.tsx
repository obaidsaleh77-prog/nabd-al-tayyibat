import type { Metadata } from "next";
import Link from "next/link";
import { getAdminStats } from "@/app/actions/admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNumberAr } from "@/lib/utils";
import { RefreshCw, Users, Utensils, ClipboardList, TrendingUp, Settings, BookOpen, ArrowLeft } from "lucide-react";

export const metadata: Metadata = { title: "لوحة الأدمن" };

export default async function AdminPage() {
  const stats = await getAdminStats();

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-red-500">غير مصرح بالوصول</p>
      </div>
    );
  }

  const statCards = [
    { label: "المستخدمون", value: stats.usersCount, icon: Users, color: "bg-primary/10 text-primary" },
    { label: "الوجبات", value: stats.mealsCount, icon: Utensils, color: "bg-secondary/10 text-secondary" },
    { label: "القواعد", value: stats.foodRulesCount, icon: ClipboardList, color: "bg-emerald-50 text-emerald-600" },
    { label: "الأحداث", value: stats.eventsCount, icon: TrendingUp, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">لوحة الإدارة</h1>
          <p className="text-sm text-muted">ملخص التطبيق وإعدادات النظام</p>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            العودة
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted">{s.label}</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{formatNumberAr(s.value)}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card>
        <h2 className="text-base font-bold text-slate-800 dark:text-white mb-1">الإدارة السريعة</h2>
        <p className="text-xs text-muted mb-4">نسخة القواعد المحلية: {stats.rulesVersion}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/updates">
            <Button variant="gradient" size="sm">
              <RefreshCw className="h-4 w-4" />
              التحديثات
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
              الإعدادات
            </Button>
          </Link>
          <Link href="/admin/content">
            <Button variant="outline" size="sm">
              <BookOpen className="h-4 w-4" />
              المدونة
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
