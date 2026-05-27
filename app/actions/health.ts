"use server";

import { createClient } from "@/lib/supabase/server";
import { getComplianceLevel } from "@/lib/compliance/calculator";

export async function getHealthDashboardData(userId: string) {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [weights, compliance, violations] = await Promise.all([
    supabase
      .from("weight_logs")
      .select("logged_at, weight_kg")
      .eq("user_id", userId)
      .gte("logged_at", thirtyDaysAgo.toISOString().slice(0, 10))
      .order("logged_at", { ascending: true }),
    supabase
      .from("compliance_snapshots")
      .select("snapshot_date, total_percent, diet_score, interval_score, logging_score")
      .eq("user_id", userId)
      .gte("snapshot_date", thirtyDaysAgo.toISOString().slice(0, 10))
      .order("snapshot_date", { ascending: true }),
    supabase
      .from("violations")
      .select("*")
      .eq("user_id", userId)
      .gte("detected_at", thirtyDaysAgo.toISOString())
      .order("detected_at", { ascending: false })
      .limit(20),
  ]);

  const weightChart = (weights.data ?? []).map((w) => ({
    date: w.logged_at,
    weight: w.weight_kg,
  }));

  const complianceChart = (compliance.data ?? []).map((c) => ({
    date: c.snapshot_date,
    percent: c.total_percent,
    level: getComplianceLevel(c.total_percent),
  }));

  const recommendations = buildRecommendations(
    compliance.data?.[compliance.data.length - 1]?.total_percent ?? 0,
    violations.data ?? []
  );

  return {
    weightChart,
    complianceChart,
    violations: violations.data ?? [],
    recommendations,
  };
}

function buildRecommendations(
  latestPercent: number,
  violations: Array<{ ingredient_name: string; category: string; severity: string }>
): string[] {
  const tips: string[] = [];

  if (latestPercent < 60) {
    tips.push("ركّز على تجنب المكونات المحظورة في وجبتك القادمة.");
    tips.push("سجّل وجباتك فوراً لتحسين دقة مؤشر الالتزام.");
  } else if (latestPercent < 80) {
    tips.push("أنت قريب من المستوى الأخضر — حافظ على الفترات بين الوجبات.");
  } else {
    tips.push("أداء ممتاز! استمر على الانتظام والتسجيل اليومي.");
  }

  if (violations.length > 0) {
    const top = violations.slice(0, 3);
    tips.push(
      `انتبه لآخر مخالفات: ${top.map((v) => v.ingredient_name).join("، ")}`
    );
  }

  tips.push("النتائج استرشادية — استشر مختصاً طبياً عند الحاجة.");

  return tips;
}
