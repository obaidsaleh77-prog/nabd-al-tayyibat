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
  Plus,
} from "lucide-react";
import { useState } from "react";
import { AppLogo } from "@/components/branding/AppLogo";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { MealForm } from "@/components/forms/MealForm";
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

function NavLinks({ enabledFlags = {}, isAdmin, onClose }: { enabledFlags?: Record<string, boolean>; isAdmin?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5" aria-label="التنقل الرئيسي">
      {NAV_ITEMS.map((item) => {
        if (item.flag && enabledFlags[item.flag] === false) return null;
        if (item.adminOnly && !isAdmin) return null;
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-150",
              active
                ? "bg-primary/10 text-primary"
                : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50",
              item.adminOnly && "border-t border-slate-100 dark:border-slate-800 mt-3 pt-4"
            )}
            aria-current={active ? "page" : undefined}
          >
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-150",
                active
                  ? "bg-primary text-white shadow-sm shadow-primary/20"
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

/* ───── شريط التنقل السفلي — تصميم عصري أنيق ───── */
function BottomNav({
  enabledFlags = {},
  isAdmin,
  onAddMeal,
}: {
  enabledFlags?: Record<string, boolean>;
  isAdmin?: boolean;
  onAddMeal: () => void;
}) {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/meals", label: "الوجبات", icon: Utensils },
    isAdmin
      ? { href: "/admin", label: "الإدارة", icon: Shield }
      : { href: "/weight", label: "الوزن", icon: Scale },
    { href: "/settings", label: "الإعدادات", icon: Settings },
  ];

  const springFast = { type: "spring" as const, stiffness: 500, damping: 30 };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden safe-bottom" aria-label="التنقل السفلي">
      <div
        className="relative mx-3 mb-3 rounded-[34px] bg-white/95 backdrop-blur-2xl shadow-elevated border border-border/40"
        style={{ height: 70 }}
      >
        {/* خط علوي دقيق كحد فاصل */}
        <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

        <div className="relative grid h-full w-full grid-cols-5 items-center">
          {items.map((item, i) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            const col = i < 2 ? i + 1 : i + 2;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center gap-0"
                style={{ gridColumnStart: col, gridRowStart: 1, paddingTop: 4 }}
              >
                {/* أيقونة بحاوية دائريّة */}
                <motion.div
                  className="relative flex items-center justify-center rounded-2xl transition-colors duration-200"
                  style={{ width: 44, height: 32 }}
                  initial={false}
                  animate={{
                    backgroundColor: active ? "rgba(3, 165, 238, 0.1)" : "transparent",
                  }}
                >
                  {active ? (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-2xl bg-primary/10"
                      transition={springFast}
                    />
                  ) : null}
                  <motion.div
                    className="relative z-10 flex items-center justify-center"
                    initial={false}
                    animate={{
                      scale: active ? 1 : 0.9,
                      y: active ? -10 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  >
                    <Icon
                      className={cn(
                        "transition-all duration-200",
                        active ? "text-primary" : "text-slate-300 dark:text-slate-500"
                      )}
                      style={{ width: 24, height: 24 }}
                      aria-hidden="true"
                    />
                  </motion.div>
                </motion.div>

                {/* التسمية */}
                <motion.span
                  className="leading-tight text-center transition-all duration-200"
                  initial={false}
                  animate={{
                    opacity: active ? 1 : 0.5,
                    y: active ? -2 : 3,
                    fontSize: active ? 10 : 9,
                  }}
                  style={{
                    color: active ? "#03A5EE" : "#94A3B8",
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          })}

          {/* FAB الأوسط — أيقونة بارزة مع تدرج وتوهج */}
          <button
            type="button"
            onClick={onAddMeal}
            className="absolute left-1/2 -translate-x-1/2 z-20 cursor-pointer"
            style={{ top: -30 }}
            aria-label="إضافة وجبة"
          >
            <motion.div
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: 62,
                height: 62,
                background: "linear-gradient(135deg, #03A5EE, #0E8BC4)",
                boxShadow: "0 6px 28px rgba(3,165,238,0.4), 0 0 0 4px white",
              }}
              whileHover={{ scale: 1.06, boxShadow: "0 8px 32px rgba(3,165,238,0.5), 0 0 0 4px white" }}
              whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {/* حلقة توهج نابضة */}
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #03A5EE, #0E8BC4)",
                  opacity: 0.25,
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0, 0.25] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <Plus className="text-white relative z-10" style={{ width: 28, height: 28 }} aria-hidden="true" />
            </motion.div>
          </button>
        </div>
      </div>
    </nav>
  );
}

const springTransition = { type: "spring", stiffness: 300, damping: 30 };

export function DashboardShellClient({ children, enabledFlags, isAdmin }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mealSheetOpen, setMealSheetOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh] bg-surface dark:bg-surface-dark">
      {/* ====== Desktop Sidebar ====== */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-l lg:border-border lg:bg-white lg:dark:border-slate-800 lg:dark:bg-slate-900">
        <div className="flex h-16 items-center justify-between px-5 border-b border-border dark:border-slate-800">
          <AppLogo size={30} />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <NavLinks enabledFlags={enabledFlags} isAdmin={isAdmin} />
        </div>
        <div className="px-3 py-4 border-t border-border dark:border-slate-800">
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-400 transition-all duration-150 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      {/* ====== Main Area ====== */}
      <div className="flex flex-1 flex-col lg:mr-0 min-h-[100dvh]">
        {/* ====== Mobile Header ====== */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 bg-white/80 dark:bg-slate-900/80 border-b border-border dark:border-slate-800 px-4 backdrop-blur-2xl safe-top lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition-all active:scale-90 dark:bg-slate-800 dark:text-slate-400"
            aria-label={sidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <AppLogo size={26} showText={false} />
            <span className="text-sm font-bold text-primary">نبض الطيبات</span>
          </div>
        </header>

        {/* ====== Mobile Drawer ====== */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={springTransition}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-0 bottom-0 w-[270px] bg-white dark:bg-slate-900 shadow-elevated"
              >
                <div className="flex h-14 items-center px-5 border-b border-border dark:border-slate-800">
                  <AppLogo size={26} />
                </div>
                <div className="overflow-y-auto px-3 py-5">
                  <NavLinks enabledFlags={enabledFlags} isAdmin={isAdmin} onClose={() => setSidebarOpen(false)} />
                </div>
                <div className="px-3 py-4 border-t border-border dark:border-slate-800">
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-slate-400 transition-all duration-150 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20"
                    >
                      <LogOut className="h-4 w-4" />
                      تسجيل الخروج
                    </button>
                  </form>
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====== Page Content ====== */}
        <main className="flex-1 px-4 pb-[120px] pt-5 lg:px-8 lg:pb-8 lg:pt-6">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      <BottomNav enabledFlags={enabledFlags} isAdmin={isAdmin} onAddMeal={() => setMealSheetOpen(true)} />

      {/* ====== Bottom Sheet — إضافة وجبة ====== */}
      <BottomSheet open={mealSheetOpen} onClose={() => setMealSheetOpen(false)} title="إضافة وجبة جديدة">
        <MealForm />
      </BottomSheet>
    </div>
  );
}
