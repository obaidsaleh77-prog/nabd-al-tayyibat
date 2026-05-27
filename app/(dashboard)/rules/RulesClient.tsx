"use client";

import { useState } from "react";
import { Search, CheckCircle, AlertTriangle, AlertCircle, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FoodRule {
  id: string;
  name: string;
  type: "allowed" | "prohibited";
  category: string;
  reason: string | null;
  severity: "low" | "medium" | "high" | "critical" | null;
  penalty_percent: number | null;
}

export function RulesClient({ initialRules }: { initialRules: FoodRule[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"allowed" | "prohibited">("allowed");

  // Filter rules based on search query and active tab
  const filteredRules = initialRules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rule.reason && rule.reason.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch && rule.type === activeTab;
  });

  // Group filtered rules by category
  const categories: Record<string, FoodRule[]> = {};
  filteredRules.forEach((rule) => {
    if (!categories[rule.category]) {
      categories[rule.category] = [];
    }
    categories[rule.category]!.push(rule);
  });

  const getSeverityBadge = (severity: string | null) => {
    switch (severity) {
      case "low":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "medium":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "high":
        return "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-800";
      case "critical":
        return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800";
      default:
        return "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border-slate-200 dark:border-slate-800";
    }
  };

  const getSeverityLabel = (severity: string | null) => {
    switch (severity) {
      case "low": return "منخفض الخطورة";
      case "medium": return "متوسط الخطورة";
      case "high": return "عالي الخطورة";
      case "critical": return "شديد الخطورة";
      default: return "غير محدد";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">دليل نظام الطيبات المرجعي</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            المرجع الرسمي للمأكولات والمشروبات المسموحة والممنوعة في نظام الطيبات للدكتور ضياء العوضي.
          </p>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Tabs */}
        <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800 w-fit">
          <button
            onClick={() => setActiveTab("allowed")}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
              activeTab === "allowed"
                ? "bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            <CheckCircle className="h-4 w-4" />
            المسموحات
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              {initialRules.filter(r => r.type === "allowed").length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("prohibited")}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
              activeTab === "prohibited"
                ? "bg-white text-red-700 shadow-sm dark:bg-slate-700 dark:text-red-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            <AlertTriangle className="h-4 w-4" />
            الممنوعات
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-300">
              {initialRules.filter(r => r.type === "prohibited").length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute right-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="ابحث عن مادة غذائية أو تصنيف أو سبب..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-4 pr-10 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Rules list grouped by category */}
      {Object.keys(categories).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(categories).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-200">
                <span className="h-4 w-1.5 rounded bg-emerald-500"></span>
                {category}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className={cn(
                      "flex flex-col justify-between overflow-hidden border p-4 transition-all hover:shadow-md",
                      item.type === "allowed"
                        ? "border-emerald-100 hover:border-emerald-300 dark:border-emerald-950/40 dark:hover:border-emerald-900"
                        : "border-red-100 hover:border-red-300 dark:border-red-950/40 dark:hover:border-red-900"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{item.name}</h3>
                        {item.type === "prohibited" && (
                          <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-semibold", getSeverityBadge(item.severity))}>
                            {getSeverityLabel(item.severity)}
                          </span>
                        )}
                      </div>
                      
                      {item.reason ? (
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{item.reason}</p>
                      ) : (
                        <p className="text-xs italic text-slate-400 dark:text-slate-500">لا يوجد تفسير مضاف.</p>
                      )}
                    </div>

                    {item.type === "prohibited" && item.penalty_percent !== null && (
                      <div className="mt-3 flex items-center justify-end border-t border-slate-100 pt-2 dark:border-slate-800">
                        <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/50 dark:text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          خصم الالتزام: {item.penalty_percent}%
                        </span>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
          <HelpCircle className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 font-bold text-slate-950 dark:text-white">لم يتم العثور على نتائج</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            جرب كتابة كلمات مفتاحية أخرى أو تحقق من اختيار علامة التبويب الصحيحة.
          </p>
        </div>
      )}
    </div>
  );
}
