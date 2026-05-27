"use client";

import { useEffect, useState } from "react";
import { formatDateAr, formatNumberAr } from "@/lib/utils";

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return (
      <div className="h-16 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
    );
  }

  const time = new Intl.DateTimeFormat("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  return (
    <div
      className="rounded-xl border border-emerald-200/60 bg-gradient-to-l from-emerald-50 to-white p-4 dark:border-emerald-800/40 dark:from-emerald-950/30 dark:to-slate-900"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="text-sm text-emerald-700 dark:text-emerald-400">اليوم</p>
      <p className="text-lg font-semibold">
        {formatDateAr(now, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400" dir="ltr">
        {time}
      </p>
    </div>
  );
}
