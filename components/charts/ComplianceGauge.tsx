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
    ring: "ring-emerald-500/30",
  },
  yellow: {
    stroke: "#F59E0B",
    bg: "text-amber-600",
    ring: "ring-amber-500/30",
  },
  red: {
    stroke: "#EF4444",
    bg: "text-red-600",
    ring: "ring-red-500/30",
  },
};

function getLevel(p: number): keyof typeof LEVEL_STYLES {
  if (p >= 80) return "green";
  if (p >= 60) return "yellow";
  return "red";
}

export function ComplianceGauge({
  percent,
  snapshot,
  size = "lg",
}: ComplianceGaugeProps) {
  const level = getLevel(percent);
  const styles = LEVEL_STYLES[level];
  const dim = size === "lg" ? 140 : 100;
  const r = (dim - 16) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border bg-white p-6 dark:bg-slate-800",
        "border-slate-200 dark:border-slate-700",
        styles.ring,
        "ring-2"
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
            strokeWidth="10"
            className="text-slate-200 dark:text-slate-700"
          />
          <motion.circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            stroke={styles.stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center",
            styles.bg
          )}
        >
          <span className="text-3xl font-bold">{formatNumberAr(percent)}%</span>
          <span className="text-xs">التزام</span>
        </div>
      </div>

      {snapshot ? (
        <div className="mt-4 grid w-full grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="text-slate-500">غذائي</p>
            <p className="font-semibold">{formatNumberAr(snapshot.diet_score)}</p>
          </div>
          <div>
            <p className="text-slate-500">فترات</p>
            <p className="font-semibold">{formatNumberAr(snapshot.interval_score)}</p>
          </div>
          <div>
            <p className="text-slate-500">تسجيل</p>
            <p className="font-semibold">{formatNumberAr(snapshot.logging_score)}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
