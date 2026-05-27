import type { Metadata } from "next";
import Link from "next/link";
import { getAdminStats } from "@/app/actions/admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { formatNumberAr } from "@/lib/utils";

export const metadata: Metadata = { title: "لوحة الأدمن" };

export default async function AdminPage() {
  const stats = await getAdminStats();

  if (!stats) {
    return <p className="p-8 text-red-600">غير مصرح</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">لوحة الإدارة</h1>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500">المستخدمون</p>
          <p className="text-2xl font-bold">{formatNumberAr(stats.usersCount)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">الوجبات المسجّلة</p>
          <p className="text-2xl font-bold">{formatNumberAr(stats.mealsCount)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">أحداث تحليلية</p>
          <p className="text-2xl font-bold">{formatNumberAr(stats.eventsCount)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">قواعد المرجع الغذائي</p>
          <p className="text-2xl font-bold">{formatNumberAr(stats.foodRulesCount)}</p>
        </Card>
      </div>

      <p className="text-sm text-slate-500">نسخة القواعد المحلية (Fallback): {stats.rulesVersion}</p>

      <nav className="flex flex-wrap gap-2">
        <Link href="/admin/updates">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2">
            <RefreshCw className="h-4 w-4" />
            التحديثات — المرجع الوحيد للتطبيق
          </Button>
        </Link>
        <Link href="/admin/settings">
          <Button variant="outline">الإعدادات</Button>
        </Link>
        <Link href="/admin/content">
          <Button variant="outline">المدونة</Button>
        </Link>
        <Link href="/admin/rules">
          <Button variant="outline">القواعد</Button>
        </Link>
        <Link href="/">
          <Button variant="ghost">العودة للتطبيق</Button>
        </Link>
      </nav>
    </div>
  );
}
