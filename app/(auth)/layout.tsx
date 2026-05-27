import Link from "next/link";
import { AppLogo } from "@/components/branding/AppLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col bg-white dark:bg-slate-900">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-white to-secondary/5 dark:from-primary/10 dark:via-slate-900 dark:to-secondary/10"
        aria-hidden="true"
      />

      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        <Link href="/login" aria-label="الصفحة الرئيسية">
          <AppLogo size={36} />
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8">
        {children}
      </main>

      <footer className="relative z-10 px-5 py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} نبض الطيبات — أداة تتبع استرشادية
      </footer>
    </div>
  );
}
