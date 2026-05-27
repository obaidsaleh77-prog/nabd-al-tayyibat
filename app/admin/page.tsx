import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getAdminStats, getAdminSettings } from "@/app/actions/admin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNumberAr } from "@/lib/utils";
import {
  RefreshCw,
  Users,
  Utensils,
  ClipboardList,
  TrendingUp,
  Settings,
  BookOpen,
  Shield,
  FileJson,
  Eye,
  Sliders,
  PlusCircle,
  Database,
  Activity,
  Bell,
  UserCheck,
  FileText,
  ListChecks,
} from "lucide-react";

export const metadata: Metadata = { title: "لوحة الأدمن" };

export default async function AdminPage() {
  const stats = await getAdminStats();
  const settings = await getAdminSettings();

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-3">
          <Shield className="mx-auto h-12 w-12 text-red-400" />
          <p className="text-sm text-red-500">غير مصرح بالوصول — صلاحيات أدمن مطلوبة</p>
          <Link href="/">
            <Button variant="ghost" size="sm">العودة للتطبيق</Button>
          </Link>
        </div>
      </div>
    );
  }

  const flags = settings?.flags ?? [];

  const sections = [
    {
      title: "المحتوى والقواعد",
      desc: "إدارة الدليل الغذائي والمقالات",
      links: [
        { href: "/admin/updates", label: "التحديثات (قواعد + مدونة)", icon: RefreshCw, color: "gradient-primary", desc: "إدارة القواعد الغذائية والمقالات في مكان واحد" },
        { href: "/admin/rules", label: "القواعد الغذائية", icon: FileJson, color: "bg-emerald-50 text-emerald-600", desc: "إضافة وتعديل وحذف قواعد المسموحات والممنوعات" },
        { href: "/admin/content", label: "المدونة", icon: BookOpen, color: "bg-blue-50 text-blue-600", desc: "كتابة ونشر المقالات التوعوية" },
      ],
    },
    {
      title: "إعدادات النظام",
      desc: "التحكم بمعايير التطبيق",
      links: [
        { href: "/admin/settings", label: "الإعدادات العامة", icon: Sliders, color: "bg-purple-50 text-purple-600", desc: "أوزان الامتثال، ميزات التطبيق، نسخة القواعد" },
      ],
    },
    {
      title: "المراقبة والتقارير",
      desc: "إحصائيات ونشاط المستخدمين",
      links: [
        { href: "/admin/settings", label: "الميزات (Feature Flags)", icon: Eye, color: "bg-amber-50 text-amber-600", desc: "تفعيل/تعطيل ميزات التطبيق (شات، كاميرا، مدونة)" },
        { href: "/admin/settings", label: "أوزان compliance", icon: Activity, color: "bg-rose-50 text-rose-600", desc: "ضبط معايير احتساب نسبة الالتزام" },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-amber-500" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">لوحة الإدارة</h1>
          </div>
          <p className="text-sm text-muted">مرحباً بالمسؤول — جميع صلاحيات النظام بين يديك</p>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm">
            العودة للتطبيق
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "المستخدمون", value: stats.usersCount, icon: Users, color: "bg-primary/10 text-primary" },
          { label: "الوجبات", value: stats.mealsCount, icon: Utensils, color: "bg-secondary/10 text-secondary" },
          { label: "القواعد", value: stats.foodRulesCount, icon: ClipboardList, color: "bg-emerald-50 text-emerald-600" },
          { label: "الأحداث", value: stats.eventsCount, icon: TrendingUp, color: "bg-amber-50 text-amber-600" },
        ].map((s) => {
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

      {sections.map((section) => (
        <div key={section.title}>
          <div className="mb-3">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">{section.title}</h2>
            <p className="text-xs text-muted">{section.desc}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {section.links.map((link) => {
              const Icon = link.icon;
              const isGradient = link.color === "gradient-primary";
              return (
                <Link key={link.href} href={link.href}>
                  <Card className={`p-4 h-full hover:shadow-elevated transition-all duration-200 active:scale-[0.98] ${isGradient ? "" : ""}`}>
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isGradient ? "gradient-primary text-white" : link.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{link.label}</p>
                        <p className="text-xs text-muted mt-0.5">{link.desc}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 border-primary/10">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">معلومات النظام</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <p className="text-muted">نسخة القواعد</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300">{stats.rulesVersion}</p>
          </div>
          <div>
            <p className="text-muted">الميزات المفعلة</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300">{flags.filter((f: any) => f.is_enabled).length} / {flags.length}</p>
          </div>
          <div>
            <p className="text-muted">البيئة</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300">{process.env.NODE_ENV}</p>
          </div>
          <div>
            <p className="text-muted">الدور</p>
            <p className="font-semibold text-amber-600">أدمن</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
