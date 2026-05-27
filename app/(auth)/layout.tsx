import Link from "next/link";
import { AppLogo } from "@/components/branding/AppLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* خلفية متدرجة — مفهوم النبض */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-emerald-50/80 via-white to-slate-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-950"
        aria-hidden="true"
      />

      <header className="relative z-10 flex items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/login" aria-label="الصفحة الرئيسية للمصادقة">
          <AppLogo size={44} />
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8">
        {children}
      </main>

      <footer className="relative z-10 px-4 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} نبض الطيبات — أداة تتبع استرشادية وليست بديلاً عن
        الاستشارة الطبية
      </footer>
    </div>
  );
}
