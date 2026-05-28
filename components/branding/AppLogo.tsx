"use client";

import { cn } from "@/lib/utils";

export interface AppLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  title?: string;
}

/** شعار نبض الطيبات — أيقونة بنفسجية + حرف "ن" جريء + ECG بارز */
export function AppLogo({
  size = 48,
  showText = true,
  className,
  title = "نبض الطيبات",
}: AppLogoProps) {
  const p = size;
  const strokeW = Math.max(Math.round(p * 0.047), 2);

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
        </defs>

        {/* ظل سادة — بديل آمن عن feDropShadow */}
        <rect x="2" y="5" width="60" height="60" rx="18" fill="#6B4EE6" opacity="0.15" />

        {/* خلفية دائريّة ناعمة مع تدرج بنفسجي */}
        <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#logoGrad)" />

        {/* حرف "ن" بخط جريء وعصري */}
        <path
          d="M17 38V22h10l6 10V22h8v16h-8l-6-10v10h-10z"
          fill="white"
          opacity="0.95"
        />

        {/* نقطة فوق حرف النون */}
        <circle cx="24" cy="20" r="2.5" fill="white" opacity="0.9" />

        {/* خط ECG — متحرك عبر animate */}
        <g transform="translate(2, 8)">
          <path
            d="M0 34 L12 34 L15 24 L18 44 L21 20 L24 38 L27 26 L30 34 L46 34"
            stroke="white"
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.2"
          />
          <path
            d="M0 34 L12 34 L15 24 L18 44 L21 20 L24 38 L27 26 L30 34 L46 34"
            stroke="white"
            strokeWidth={strokeW}
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
              repeatCount="indefinite"
            />
          </path>
          <circle cx="46" cy="34" r={strokeW * 1.5} fill="white" opacity="0.95">
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
