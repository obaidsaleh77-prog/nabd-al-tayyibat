import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isFeatureEnabled } from "@/lib/features";
import { BookOpen } from "lucide-react";
import { BlogView } from "@/components/blog/BlogView";
import { Card } from "@/components/ui/card";
import type { BlogPost } from "@/types/database";

export const metadata: Metadata = { title: "المدونة" };

export default async function BlogPage() {
  const enabled = await isFeatureEnabled("blog");
  if (!enabled) {
    return (
      <div className="mx-auto max-w-2xl pt-8 animate-fade-in">
        <Card className="text-center py-10">
          <BookOpen className="mx-auto h-10 w-10 text-muted mb-3" />
          <p className="text-muted text-sm">المدونة غير متاحة حالياً.</p>
        </Card>
      </div>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">المدونة</h1>
        </div>
        <p className="text-sm text-muted">مقالات تعليمية عن نظام الطيبات</p>
      </div>
      <BlogView posts={(data ?? []) as BlogPost[]} />
    </div>
  );
}
