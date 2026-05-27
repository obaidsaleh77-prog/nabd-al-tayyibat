import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isFeatureEnabled } from "@/lib/features";
import { BlogView } from "@/components/blog/BlogView";
import { Card } from "@/components/ui/card";
import type { BlogPost } from "@/types/database";

export const metadata: Metadata = { title: "نبض الطيبات — المدونة" };

export default async function BlogPage() {
  const enabled = await isFeatureEnabled("blog");
  if (!enabled) {
    return (
      <Card>
        <p className="text-slate-500">المدونة غير متاحة حالياً.</p>
      </Card>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">نبض الطيبات</h1>
      <BlogView posts={(data ?? []) as BlogPost[]} />
    </div>
  );
}
