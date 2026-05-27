"use client";

import { motion } from "framer-motion";
import { cn, formatNumberAr } from "@/lib/utils";
import type { ComplianceSnapshot } from "@/types/database";

interface ComplianceGaugeProps {
  percent: number;
  snapshot?: ComplianceSnapshot | null;
  size?: "sm" | "lg";
}

const LEVEL_STYLES = {
  green: {
    stroke: "#10B981",
    bg: "text-emerald-600",
    ring: "ring-emerald-500/20",
  },
  yellow: {
    stroke: "#F59E0B",
    bg: "text-amber-600",
    ring: "ring-amber-500/20",
  },
  red: {
    stroke: "#EF4444",
    bg: "text-red-500",
    ring: "ring-red-500/20",
  },
};

function getLevel(p: number): keyof typeof LEVEL_STYLES {
  if (p >= 80) return "green";
  if (p >= 60) return "yellow";
  return "red";
}

function StatusIcon({ level }: { level: keyof typeof LEVEL_STYLES }) {
  const icons = {
    green: "✓",
    yellow: "!",
    red: "✕",
  };
  return <span className="text-lg font-bold">{icons[level]}</span>;
}

export function ComplianceGauge({
  percent,
  snapshot,
  size = "lg",
}: ComplianceGaugeProps) {
  const level = getLevel(percent);
  const styles = LEVEL_STYLES[level];
  const dim = size === "lg" ? 120 : 88;
  const r = (dim - 16) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl bg-white p-5 shadow-card dark:bg-slate-800 dark:shadow-card-dark"
      )}
      role="meter"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`نسبة الالتزام ${percent} بالمئة`}
    >
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-100 dark:text-slate-700"
          />
          <motion.circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            stroke={styles.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className={cn("absolute inset-0 flex flex-col items-center justify-center", styles.bg)}>
          <StatusIcon level={level} />
        </div>
      </div>

      <span className={cn("mt-2 text-2xl font-bold", styles.bg)}>
        {formatNumberAr(percent)}%
      </span>
      <span className="text-xs text-muted -mt-0.5">نسبة الالتزام</span>

      {snapshot ? (
        <div className="mt-4 grid w-full grid-cols-3 gap-3 border-t border-slate-100 pt-4 dark:border-slate-700">
          {[
            { label: "غذائي", value: snapshot.diet_score },
            { label: "فترات", value: snapshot.interval_score },
            { label: "تسجيل", value: snapshot.logging_score },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-xs text-muted">{s.label}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {formatNumberAr(s.value)}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
