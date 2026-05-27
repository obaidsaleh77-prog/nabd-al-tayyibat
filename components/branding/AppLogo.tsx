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
  return (
    <div
      className={cn("inline-flex items-center gap-2.5", className)}
      role="img"
      aria-label={title}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logo-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#logo-g)" />

        <motion.path
          d="M20 44V22h6l10 14V22h6v22h-6L26 30v14h-6z"
          fill="white"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />

        <motion.circle
          cx="44"
          cy="44"
          r="10"
          fill="white"
          opacity="0.2"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {showText ? (
        <div className="flex items-baseline gap-1">
          <span className="bg-gradient-to-l from-primary to-secondary bg-clip-text text-lg font-bold text-transparent">
            نبض
          </span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
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
