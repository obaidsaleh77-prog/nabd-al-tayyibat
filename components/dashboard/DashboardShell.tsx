"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { useState } from "react";
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
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/meals", label: "الوجبات", icon: Utensils },
  { href: "/weight", label: "الوزن", icon: Scale },
  { href: "/health-status", label: "الصحة", icon: Activity },
  { href: "/rules", label: "الدليل", icon: ClipboardList },
  { href: "/ai-chat", label: "اسألني", icon: MessageCircle, flag: "ai_chat" },
  { href: "/blog", label: "المدونة", icon: BookOpen, flag: "blog" },
  { href: "/camera", label: "الكاميرا", icon: Camera, flag: "camera_ocr" },
  { href: "/settings", label: "الإعدادات", icon: Settings },
  { href: "/admin", label: "الإدارة", icon: Shield, adminOnly: true },
];

interface DashboardShellProps {
  children: React.ReactNode;
  enabledFlags?: Record<string, boolean>;
  isAdmin?: boolean;
}

function NavLinks({ enabledFlags = {}, isAdmin }: { enabledFlags?: Record<string, boolean>; isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="التنقل الرئيسي">
      {NAV_ITEMS.map((item) => {
        if (item.flag && enabledFlags[item.flag] === false) return null;
        if (item.adminOnly && !isAdmin) return null;
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
              active
                ? "bg-primary/10 text-primary"
                : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50",
              item.adminOnly && "border-t border-slate-100 dark:border-slate-800 mt-2 pt-3"
            )}
            aria-current={active ? "page" : undefined}
          >
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                active
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:group-hover:bg-slate-700"
              )}
            >
              <Icon className="h-4.5 w-4.5" aria-hidden="true" />
            </div>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function BottomNav({ enabledFlags = {}, isAdmin }: { enabledFlags?: Record<string, boolean>; isAdmin?: boolean }) {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/meals", label: "الوجبات", icon: Utensils },
    isAdmin
      ? { href: "/admin", label: "الإدارة", icon: Shield }
      : { href: "/weight", label: "الوزن", icon: Scale },
    { href: "/settings", label: "الإعدادات", icon: Settings },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden"
      aria-label="التنقل السفلي"
      style={{ height: 88 }}
    >
      {/* الخلفية بزوايا دائرية علوية */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#DCD7EC",
          borderRadius: "20px 20px 0 0",
        }}
      />

      {/* عناصر التنقل — شبكة 5 أعمدة مع فراغ وسط للـ FAB */}
      <div className="relative grid h-full w-full grid-cols-5 items-start px-2" style={{ paddingTop: 14 }}>
        {items.map((item, i) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          // وضع العناصر في الأعمدة 1 و 2 و 4 و 5
          const col = i < 2 ? i + 1 : i + 2;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-1 transition-all",
                `col-start-${col}`
              )}
              style={{ gridColumnStart: col }}
            >
              {/* خلفية الـ active — تصميم دائري */}
              {active ? (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute rounded-full bg-white/60"
                  style={{
                    width: 56,
                    height: 56,
                    top: -4,
                    left: "50%",
                    marginLeft: -28,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              ) : null}

              <motion.div
                className="relative z-10 flex items-center justify-center"
                initial={false}
                animate={{
                  scale: active ? 1.1 : 1,
                  y: active ? -2 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Icon
                  className={cn(
                    "transition-colors duration-200",
                    active ? "text-black" : "text-black/45"
                  )}
                  style={{ width: 32, height: 32 }}
                  aria-hidden="true"
                />
              </motion.div>
              <span
                className={cn(
                  "relative z-10 text-xs font-bold leading-tight transition-colors duration-200",
                  active ? "text-black" : "text-black/45"
                )}
                style={{ fontSize: 14 }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* الزر العائم الأوسط — الكاميرا */}
        <Link
          href="/camera"
          className="absolute top-0 left-1/2 -translate-x-1/2 z-20"
          style={{ marginTop: -4 }}
        >
          <motion.div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 110,
              height: 110,
              backgroundColor: "#E7E3F3",
              border: "8px solid #F5F5F5",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Camera
              className="text-black"
              style={{ width: 36, height: 36 }}
              aria-hidden="true"
            />
          </motion.div>
        </Link>
      </div>
    </nav>
  );
}

const springTransition = { type: "spring", stiffness: 300, damping: 30 };

export function DashboardShellClient({ children, enabledFlags, isAdmin }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface dark:bg-surface-dark">
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-l lg:border-slate-200 lg:bg-white lg:dark:border-slate-800 lg:dark:bg-slate-900">
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800">
          <AppLogo size={32} />
          <ThemeToggle />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <NavLinks enabledFlags={enabledFlags} isAdmin={isAdmin} />
        </div>
        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800">
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-3 text-slate-400 hover:text-red-500"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:mr-0">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 bg-white/70 dark:bg-slate-900/70 border-b border-slate-100 dark:border-slate-800 px-4 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            aria-label={sidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <AppLogo size={28} showText={false} />
          <span className="text-sm font-bold text-primary">نبض الطيبات</span>
          <div className="mr-auto">
            <ThemeToggle />
          </div>
        </header>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={springTransition}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-0 bottom-0 w-[260px] bg-white dark:bg-slate-900 shadow-elevated"
              >
                <div className="flex h-14 items-center px-5 border-b border-slate-100 dark:border-slate-800">
                  <AppLogo size={28} />
                </div>
                <div className="overflow-y-auto px-3 py-5">
                  <NavLinks enabledFlags={enabledFlags} isAdmin={isAdmin} />
                </div>
                <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800">
                  <form action={signOutAction}>
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-3 text-slate-400 hover:text-red-500"
                    >
                      <LogOut className="h-4 w-4" />
                      تسجيل الخروج
                    </Button>
                  </form>
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 px-4 pb-24 pt-5 lg:px-8 lg:pb-8 lg:pt-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      <BottomNav enabledFlags={enabledFlags} isAdmin={isAdmin} />
    </div>
  );
}
