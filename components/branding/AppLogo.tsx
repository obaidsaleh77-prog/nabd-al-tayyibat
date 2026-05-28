"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AppLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  title?: string;
}

/** شعار نبض الطيبات — تصميم عصري مع ECG Pulse كحركة خفيفة */
export function AppLogo({
  size = 48,
  showText = true,
  className,
  title = "نبض الطيبات",
}: AppLogoProps) {
  const p = size; // scale reference
  const strokeW = Math.round(p * 0.047);

  return (
    <div
      className={cn("inline-flex items-center gap-2.5", className)}
      role="img"
      aria-label={title}
    >
      <svg
        width={p}
        height={p}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#03A5EE" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <filter id="logoShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* خلفية دائريّة ناعمة مع تدرج */}
        <rect
          x="2" y="2" width="60" height="60" rx="18"
          fill="url(#logoGrad)"
          filter="url(#logoShadow)"
        />

        {/* حرف "ن" بخط عصري */}
        <path
          d="M17 38V22h10l6 10V22h8v16h-8l-6-10v10h-4z"
          fill="white"
          opacity="0.92"
        />

        {/* نقطة فوق حرف النون */}
        <circle cx="24" cy="20" r="2.2" fill="white" opacity="0.85" />

        {/* خط ECG / Heartbeat — يتحرك كموجة نبض باستخدام SVG animate */}
        <g transform="translate(2, 0)">
          <path
            d="M0 42 L12 42 L15 32 L18 52 L21 28 L24 46 L27 34 L30 42 L46 42"
            stroke="white"
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.2"
          />
          <path
            d="M0 42 L12 42 L15 32 L18 52 L21 28 L24 46 L27 34 L30 42 L46 42"
            stroke="white"
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.9"
            strokeDasharray="80"
            strokeDashoffset="80"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="80" to="0"
              dur="2s"
              begin="0s"
              fill="freeze"
              repeatCount="indefinite"
            />
          </path>
          <circle cx="46" cy="42" r={strokeW * 1.2} fill="white" opacity="0.9">
            <animate
              attributeName="opacity"
              values="0.9;0.3;0.9"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </svg>

      {showText ? (
        <div className="flex flex-col leading-tight">
          <span className="bg-gradient-to-l from-[#03A5EE] to-[#10B981] bg-clip-text text-lg font-bold text-transparent">
            نبض
          </span>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 -mt-0.5 tracking-wide">
            الطيبات
          </span>
        </div>
      ) : null}
    </div>
  );
}

/** شعار بدون نص (للايقونة فقط) — للهيدر والمواضع الصغيرة */
export function AppLogoMark({ size = 64 }: { size?: number }) {
  return <AppLogo size={size} showText={false} title="شعار نبض الطيبات" />;
}
