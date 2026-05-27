import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";
import { getFoodRulesAction } from "@/app/actions/rules";
import { RulesClient } from "./RulesClient";

export const metadata: Metadata = {
  title: "الدليل الغذائي المرجعي",
  description: "المسموحات والممنوعات في نظام الطيبات للدكتور ضياء العوضي",
};

export default async function RulesPage() {
  const rules = await getFoodRulesAction();

  return (
    <div className="mx-auto max-w-4xl space-y-5 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">الدليل الغذائي</h1>
        </div>
        <p className="text-sm text-muted">المسموحات والممنوعات في نظام الطيبات</p>
      </div>
      <RulesClient initialRules={rules as any} />
    </div>
  );
}
