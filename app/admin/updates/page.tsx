import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFoodRulesAction } from "@/app/actions/rules";
import { getAdminBlogPosts } from "@/app/actions/admin";
import { AdminUpdatesClient } from "./AdminUpdatesClient";
import type { BlogPost } from "@/types/database";

export const metadata: Metadata = { title: "التحديثات — لوحة الأدمن" };

export default async function AdminUpdatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return <p className="p-8 text-red-600">غير مصرح لك بدخول هذه الصفحة.</p>;
  }

  const [rules, posts] = await Promise.all([
    getFoodRulesAction(),
    getAdminBlogPosts(),
  ]);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">التحديثات</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            التعديلات التي تجريها هنا هي المرجع الوحيد لجميع خصائص التطبيق
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm text-emerald-600 underline-offset-2 hover:underline dark:text-emerald-400"
        >
          عودة للوحة الرئيسية
        </Link>
      </div>

      <AdminUpdatesClient initialRules={rules as any} posts={posts as BlogPost[]} />
    </div>
  );
}
