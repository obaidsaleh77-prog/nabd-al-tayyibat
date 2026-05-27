"use client";

import { useState } from "react";
import { ClipboardList, BookOpen, RefreshCw } from "lucide-react";
import { AdminRulesClient } from "../rules/AdminRulesClient";
import { AdminBlogEditor } from "@/components/admin/AdminBlogEditor";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/types/database";

interface FoodRule {
  id: string;
  name: string;
  type: "allowed" | "prohibited";
  category: string;
  reason: string | null;
  severity: "low" | "medium" | "high" | "critical" | null;
  penalty_percent: number | null;
}

type Tab = "rules" | "blog";

interface AdminUpdatesClientProps {
  initialRules: FoodRule[];
  posts: BlogPost[];
}

export function AdminUpdatesClient({ initialRules, posts }: AdminUpdatesClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("rules");

  const tabs: { key: Tab; label: string; icon: typeof ClipboardList }[] = [
    { key: "rules", label: "المسموحات والممنوعات", icon: ClipboardList },
    { key: "blog", label: "المدونة", icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        <RefreshCw className="h-3 w-3" />
        <span>آخر التحديثات تنعكس تلقائياً على الكاميرا، الفحص، شات الذكاء الاصطناعي، وجميع صفحات التطبيق</span>
      </div>

      <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-all",
                activeTab === tab.key
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "rules" ? (
        <AdminRulesClient initialRules={initialRules} />
      ) : (
        <AdminBlogEditor posts={posts} />
      )}
    </div>
  );
}
