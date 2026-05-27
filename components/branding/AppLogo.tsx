"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AppLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  title?: string;
}

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
          <linearGradient id="logo-primary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5A4BD1" />
            <stop offset="100%" stopColor="#6C5CE7" />
          </linearGradient>
          <linearGradient id="logo-secondary" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00CEC9" />
            <stop offset="100%" stopColor="#55E6C1" />
          </linearGradient>
        </defs>

        <circle
          cx="32"
          cy="32"
          r="30"
          className="fill-primary/5 dark:fill-primary/10"
        />

        <path
          d="M18 44V20h6l10 16V20h6v24h-6L24 28v16h-6z"
          fill="url(#logo-primary)"
        />

        <motion.path
          d="M8 32h10l4-8 4 16 4-12 4 8h18"
          stroke="url(#logo-secondary)"
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

        <motion.circle
          cx="52"
          cy="32"
          r="3"
          fill="#00CEC9"
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {showText ? (
        <div className="flex flex-col leading-tight">
          <span className="bg-gradient-to-l from-[#5A4BD1] to-[#6C5CE7] bg-clip-text text-lg font-bold text-transparent dark:from-[#8B7CF7] dark:to-[#6C5CE7]">
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

export function AppLogoMark({ size = 64 }: { size?: number }) {
  return <AppLogo size={size} showText={false} title="شعار نبض الطيبات" />;
}
