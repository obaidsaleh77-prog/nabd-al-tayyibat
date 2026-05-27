"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatNumberAr } from "@/lib/utils";

interface WeightChartProps {
  data: Array<{ date: string; weight: number }>;
}

export function WeightChart({ data }: WeightChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">لا توجد بيانات وزن بعد</p>
    );
  }

  return (
    <div className="h-64 w-full" role="img" aria-label="مخطط الوزن">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v: number) => formatNumberAr(v)}
            domain={["auto", "auto"]}
          />
          <Tooltip
            formatter={(value: number) => [`${formatNumberAr(value)} كغ`, "الوزن"]}
            labelFormatter={(label: string) => label}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ fill: "#059669", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
