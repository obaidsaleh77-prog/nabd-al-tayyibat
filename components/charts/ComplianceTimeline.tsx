"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatNumberAr } from "@/lib/utils";

interface ComplianceTimelineProps {
  data: Array<{ date: string; percent: number; level: string }>;
}

const COLORS: Record<string, string> = {
  green: "#10B981",
  yellow: "#F59E0B",
  red: "#EF4444",
};

export function ComplianceTimeline({ data }: ComplianceTimelineProps) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">لا توجد بيانات التزام بعد</p>
    );
  }

  return (
    <div className="h-64 w-full" role="img" aria-label="مخطط الالتزام الزمني">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v: string) => v.slice(5)} />
          <YAxis domain={[0, 100]} tickFormatter={(v: number) => formatNumberAr(v)} />
          <Tooltip formatter={(value: number) => [`${formatNumberAr(value)}%`, "الالتزام"]} />
          <Bar dataKey="percent" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={COLORS[entry.level] ?? COLORS.green} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
