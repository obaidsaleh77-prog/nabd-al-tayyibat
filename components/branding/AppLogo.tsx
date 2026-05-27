"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AppLogoProps {
  /** عرض الشعار بالبكسل */
  size?: number;
  /** إظهار النص بجانب الشعار */
  showText?: boolean;
  className?: string;
  /** معرّف للوصولية */
  title?: string;
}

/**
 * شعار نبض الطيبات — حرف «ن» هندسي مع خط نبض ECG
 * ألوان: زمردي (#059669 → #10B981) + لمسة ذهبية (#F59E0B)
 */
export function AppLogo({
  size = 48,
  showText = true,
  className,
  title = "نبض الطيبات",
}: AppLogoProps) {
  const height = size;
  const width = showText ? size * 2.8 : size;

  return (
    <div
      className={cn("inline-flex items-center gap-3", className)}
      role="img"
      aria-label={title}
    >
      <svg
        width={size}
        height={height}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logo-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="logo-gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>

        {/* خلفية دائرية خفيفة */}
        <circle
          cx="32"
          cy="32"
          r="30"
          className="fill-emerald-50 dark:fill-emerald-950/40"
        />

        {/* حرف «ن» هندسي */}
        <path
          d="M18 44V20h6l10 16V20h6v24h-6L24 28v16h-6z"
          fill="url(#logo-emerald)"
        />

        {/* خط النبض ECG — يمر عبر الحرف */}
        <motion.path
          d="M8 32h10l4-8 4 16 4-12 4 8h18"
          stroke="url(#logo-gold)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0.6 }}
          animate={{
            pathLength: [0, 1, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            pathLength: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
        />

        {/* نقطة نبض */}
        <motion.circle
          cx="52"
          cy="32"
          r="3"
          fill="#F59E0B"
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {showText ? (
        <div className="flex flex-col leading-tight">
          <span className="bg-gradient-to-l from-emerald-700 to-emerald-500 bg-clip-text text-lg font-bold text-transparent dark:from-emerald-400 dark:to-emerald-300">
            نبض
          </span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            الطيبات
          </span>
        </div>
      ) : null}
    </div>
  );
}

/** نسخة SVG قابلة للتصدير (بدون نص) */
export function AppLogoMark({ size = 64 }: { size?: number }) {
  return <AppLogo size={size} showText={false} title="شعار نبض الطيبات" />;
}
