"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Utensils,
  Scale,
  Activity,
  MessageCircle,
  BookOpen,
  Camera,
  Settings,
  ClipboardList,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { AppLogo } from "@/components/branding/AppLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  flag?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/meals", label: "الوجبات", icon: Utensils },
  { href: "/weight", label: "الوزن", icon: Scale },
  { href: "/health-status", label: "الحالة الصحية", icon: Activity },
  { href: "/rules", label: "الدليل الغذائي", icon: ClipboardList },
  { href: "/ai-chat", label: "اسألني", icon: MessageCircle, flag: "ai_chat" },
  { href: "/blog", label: "المدونة", icon: BookOpen, flag: "blog" },
  { href: "/camera", label: "الكاميرا", icon: Camera, flag: "camera_ocr" },
  { href: "/settings", label: "الإعدادات", icon: Settings },
];

interface DashboardShellProps {
  children: React.ReactNode;
  enabledFlags?: Record<string, boolean>;
}

function NavLinks({ enabledFlags = {} }: { enabledFlags?: Record<string, boolean> }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1.5 px-2" aria-label="التنقل الرئيسي">
      {NAV_ITEMS.map((item) => {
        if (item.flag && enabledFlags[item.flag] === false) return null;
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
              active
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className={cn("h-5 w-5 shrink-0", active ? "text-primary" : "")} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShellClient({ children, enabledFlags }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-l border-slate-200 bg-white px-3 py-5 dark:border-slate-800 dark:bg-slate-900 lg:w-64 lg:border-l-0 lg:border-b-0 lg:border-l">
        <div className="mb-8 flex items-center justify-between px-2">
          <AppLogo size={36} />
          <ThemeToggle />
        </div>
        <NavLinks enabledFlags={enabledFlags} />
        <form action={signOutAction} className="mt-8 px-2">
          <Button type="submit" variant="outline" size="sm" className="w-full gap-2 text-slate-500">
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </form>
      </aside>
      <main className="flex-1 px-6 py-6 lg:px-10">{children}</main>
    </div>
  );
}
