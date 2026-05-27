import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFoodRulesAction } from "@/app/actions/rules";
import { AdminRulesClient } from "./AdminRulesClient";

export const metadata: Metadata = { title: "إدارة المسموحات والممنوعات" };

export default async function AdminRulesPage() {
  // Check authorization
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return <p className="p-8 text-red-600">غير مصرح لك بدخول هذه الصفحة.</p>;
  }

  const rules = await getFoodRulesAction();

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <AdminRulesClient initialRules={rules as any} />
    </div>
  );
}
