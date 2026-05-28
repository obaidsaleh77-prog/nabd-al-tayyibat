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
  userName?: string | null;
  userEmail?: string | null;
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

/* ───── شريط سفلي عائم — تصميم مطابق للمرجع ───── */
function BottomNav({
  enabledFlags = {},
  isAdmin,
}: {
  enabledFlags?: Record<string, boolean>;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();

  /* الترتيب من اليمين لليسار (RTL): الرئيسية | الإحصائيات | [FAB] | الوجبات | الملف */
  const items = [
    { href: "/", label: "الرئيسية", icon: LayoutDashboard },
    { href: "/health-status", label: "الإحصائيات", icon: Activity },
    { href: "/meals", label: "الوجبات", icon: Utensils },
    { href: "/settings", label: "الملف", icon: Settings },
  ];

  const springFast = { type: "spring" as const, stiffness: 500, damping: 30 };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden" aria-label="التنقل السفلي">
      <div
        className="relative mx-4 mb-4 rounded-[24px] bg-white/95 backdrop-blur-xl"
        style={{
          height: 68,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)",
        }}
      >
        <div className="relative grid h-full w-full grid-cols-5 items-center">
          {items.map((item, i) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            const col = i < 2 ? i + 1 : i + 2;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center"
                style={{ gridColumnStart: col, gridRowStart: 1 }}
              >
                {/* الأيقونة — النشط: خلفية بنفسجية فاتحة */}
                <motion.div
                  className="relative flex items-center justify-center rounded-xl transition-colors duration-200"
                  style={{ width: 42, height: 36 }}
                  initial={false}
                  animate={{
                    backgroundColor: active ? "rgba(107,78,230,0.1)" : "transparent",
                  }}
                >
                  {active ? (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-xl bg-purple-50"
                      style={{ backgroundColor: "rgba(107,78,230,0.1)" }}
                      transition={springFast}
                    />
                  ) : null}
                  <motion.div
                    className="relative z-10 flex items-center justify-center"
                    initial={false}
                    animate={{
                      scale: active ? 1 : 0.9,
                      y: active ? -6 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  >
                    <Icon
                      className={cn("transition-all duration-200", active ? "text-[#6B4EE6]" : "text-slate-400")}
                      style={{ width: 22, height: 22, strokeWidth: 1.5 }}
                      aria-hidden="true"
                    />
                  </motion.div>
                </motion.div>

                {/* التسمية */}
                <span
                  className={cn(
                    "leading-tight text-center transition-all duration-200",
                    active ? "font-bold" : "font-medium"
                  )}
                  style={{
                    fontSize: active ? 10 : 8.5,
                    color: active ? "#6B4EE6" : "#94A3B8",
                    opacity: active ? 1 : 0.5,
                    marginTop: active ? 1 : 4,
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* FAB أوسط — دائرة بنفسجية مع أيقونة كاميرا */}
          <Link
            href="/camera"
            className="absolute left-1/2 -translate-x-1/2 z-20"
            style={{ top: -24 }}
            aria-label="الماسح الضوئي"
          >
            <motion.div
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: 58,
                height: 58,
                background: "linear-gradient(135deg, #6B4EE6, #8B7EF5)",
                boxShadow: "0 8px 28px rgba(107,78,230,0.35), 0 0 0 3px white",
              }}
              whileHover={{ scale: 1.07, boxShadow: "0 10px 34px rgba(107,78,230,0.45), 0 0 0 3px white" }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {/* حلقة توهج نابضة */}
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #6B4EE6, #8B7EF5)",
                  opacity: 0.2,
                }}
                animate={{ scale: [1, 1.35, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <Camera
                className="text-white relative z-10"
                style={{ width: 26, height: 26, strokeWidth: 1.5 }}
                aria-hidden="true"
              />
            </motion.div>
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ───── مكونات القائمة المتنقلة المنظمة ───── */
function MenuSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block px-4 pb-1.5 text-[11px] font-bold text-slate-400 tracking-wider">
        {label}
      </span>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function MenuItem({
  href,
  icon: Icon,
  label,
  pathname,
  onClose,
}: {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
  pathname: string;
  onClose: () => void;
}) {
  const active = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        "group flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-all duration-150",
        active
          ? "bg-[#6B4EE6]/10 text-[#6B4EE6]"
          : "text-slate-600 hover:bg-slate-50"
      )}
      aria-current={active ? "page" : undefined}
    >
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-150",
          active
            ? "bg-[#6B4EE6] text-white shadow-sm shadow-[#6B4EE6]/20"
            : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
        )}
      >
        <Icon className="h-4.5 w-4.5" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

const springTransition = { type: "spring", stiffness: 300, damping: 30 };

export function DashboardShellClient({ children, enabledFlags = {}, isAdmin, userName, userEmail }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

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

        {/* ====== Mobile Overlay Menu — فوق كل شيء ====== */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-[60] lg:hidden"
              style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
              onClick={() => setSidebarOpen(false)}
            >
              {/* اللوحة — منزلقة من اليمين مع RTL */}
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-0 bottom-0 right-0 flex w-[290px] max-w-[85vw] flex-col bg-white shadow-elevated"
                style={{ direction: "rtl" }}
              >
                {/* ── الرأس: الشعار + اسم المستخدم + زر الإغلاق ── */}
                <header className="flex shrink-0 items-center justify-between px-5 pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6B4EE6] to-[#8B7EF5] text-white shadow-sm shadow-[#6B4EE6]/20">
                      <span className="text-sm font-bold">ن</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800">نبض الطيبات</span>
                      {userName ? (
                        <span className="text-[11px] font-medium text-muted">{userName}</span>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 active:scale-90"
                    aria-label="إغلاق القائمة"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </header>

                {/* ── المحتوى القابل للتمرير ── */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
                  <nav className="flex flex-col gap-6" aria-label="القائمة الرئيسية">
                    {/* ⋆ المجموعة 1: الرئيسية ⋆ */}
                    <MenuSection label="التصفح الرئيسي">
                      <MenuItem href="/" icon={LayoutDashboard} label="الرئيسية" pathname={pathname} onClose={() => setSidebarOpen(false)} />
                      <MenuItem href="/health-status" icon={Activity} label="الإحصائيات" pathname={pathname} onClose={() => setSidebarOpen(false)} />
                    </MenuSection>

                    {/* ⋆ المجموعة 2: الوجبات والصحة ⋆ */}
                    <MenuSection label="الوجبات والصحة">
                      <MenuItem href="/meals" icon={Utensils} label="الوجبات" pathname={pathname} onClose={() => setSidebarOpen(false)} />
                      <MenuItem href="/weight" icon={Scale} label="الوزن" pathname={pathname} onClose={() => setSidebarOpen(false)} />
                      <MenuItem href="/rules" icon={ClipboardList} label="الدليل الغذائي" pathname={pathname} onClose={() => setSidebarOpen(false)} />
                    </MenuSection>

                    {/* ⋆ المجموعة 3: المساعدات الذكية ⋆ */}
                    {enabledFlags.ai_chat !== false && (
                      <MenuSection label="المساعدات الذكية">
                        <MenuItem href="/ai-chat" icon={MessageCircle} label="اسألني" pathname={pathname} onClose={() => setSidebarOpen(false)} />
                        <MenuItem href="/camera" icon={Camera} label="الماسح الضوئي" pathname={pathname} onClose={() => setSidebarOpen(false)} />
                        {enabledFlags.blog !== false && (
                          <MenuItem href="/blog" icon={BookOpen} label="المدونة" pathname={pathname} onClose={() => setSidebarOpen(false)} />
                        )}
                      </MenuSection>
                    )}

                    {/* ⋆ المجموعة 4: الحساب والعام ⋆ */}
                    <MenuSection label="الحساب والعام">
                      <MenuItem href="/settings" icon={Settings} label="الإعدادات" pathname={pathname} onClose={() => setSidebarOpen(false)} />
                      <MenuItem href="/disclaimer" icon={Shield} label="سياسة الخصوصية" pathname={pathname} onClose={() => setSidebarOpen(false)} />
                      {isAdmin && (
                        <MenuItem href="/admin" icon={Shield} label="لوحة الإدارة" pathname={pathname} onClose={() => setSidebarOpen(false)} />
                      )}
                    </MenuSection>
                  </nav>
                </div>

                {/* ── تذييل: تسجيل الخروج + الإصدار ── */}
                <div className="shrink-0 border-t border-border px-3 pt-3 pb-5 safe-bottom">
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-red-500 transition-all duration-150 hover:bg-red-50 active:scale-[0.97]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500">
                        <LogOut className="h-4 w-4" strokeWidth={1.5} />
                      </div>
                      <span>تسجيل الخروج</span>
                    </button>
                  </form>
                  <p className="mt-3 text-center text-[10px] text-slate-300 font-medium">نبض الطيبات · v1.0.0</p>
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

      <BottomNav enabledFlags={enabledFlags} isAdmin={isAdmin} />
    </div>
  );
}
