import type { Metadata } from "next";
import { getFoodRulesAction } from "@/app/actions/rules";
import { RulesClient } from "./RulesClient";

export const metadata: Metadata = {
  title: "الدليل الغذائي المرجعي",
  description: "المسموحات والممنوعات في نظام الطيبات للدكتور ضياء العوضي",
};

export default async function RulesPage() {
  const rules = await getFoodRulesAction();

  return (
    <div className="container mx-auto max-w-6xl py-4">
      <RulesClient initialRules={rules as any} />
    </div>
  );
}
