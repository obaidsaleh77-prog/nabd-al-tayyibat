"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AppLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  title?: string;
}

/** شعار نبض الطيبات — أيقونة بنفسجية مع حرف "ن" و ECG بارز */
export function AppLogo({
  size = 48,
  showText = true,
  className,
  title = "نبض الطيبات",
}: AppLogoProps) {
  const p = size;
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
            <stop offset="0%" stopColor="#6B4EE6" />
            <stop offset="100%" stopColor="#8B7EF5" />
          </linearGradient>
          <filter id="logoShadow">
            <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#6B4EE6" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* خلفية دائريّة ناعمة مع تدرج بنفسجي + ظل أعمق */}
        <rect
          x="2" y="2" width="60" height="60" rx="18"
          fill="url(#logoGrad)"
          filter="url(#logoShadow)"
        />

        {/* حرف "ن" بخط جريء وعصري */}
        <path
          d="M15 40V20h12l7 12V20h10v20h-10l-7-12v12h-6z"
          fill="white"
          opacity="0.95"
        />

        {/* نقطة فوق حرف النون — أكبر قليلاً للوضوح */}
        <circle cx="23" cy="18" r="2.5" fill="white" opacity="0.9" />

        {/* خط ECG بنسبة تباين أعلى */}
        <g transform="translate(2, 0)">
          <path
            d="M0 42 L12 42 L15 32 L18 52 L21 28 L24 46 L27 34 L30 42 L46 42"
            stroke="white"
            strokeWidth={strokeW + 0.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.2"
          />
          <path
            d="M0 42 L12 42 L15 32 L18 52 L21 28 L24 46 L27 34 L30 42 L46 42"
            stroke="white"
            strokeWidth={strokeW + 0.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.95"
            strokeDasharray="80"
            strokeDashoffset="80"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="80" to="0"
              dur="1.8s"
              begin="0s"
              fill="freeze"
              repeatCount="indefinite"
            />
          </path>
          <circle cx="46" cy="42" r={strokeW * 1.5} fill="white" opacity="0.95">
            <animate
              attributeName="opacity"
              values="0.95;0.3;0.95"
              dur="1.8s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </svg>

      {showText ? (
        <div className="flex flex-col leading-tight">
          <span className="bg-gradient-to-l from-[#6B4EE6] to-[#8B7EF5] bg-clip-text text-lg font-bold text-transparent">
            نبض
          </span>
          <span className="text-[10px] font-medium text-muted -mt-0.5 tracking-wide">
            الطيبات
          </span>
        </div>
      ) : null}
    </div>
  );
}

/** شعار بدون نص — للهيدر والمواضع الصغيرة */
export function AppLogoMark({ size = 64 }: { size?: number }) {
  return <AppLogo size={size} showText={false} title="شعار نبض الطيبات" />;
}
