import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isFeatureEnabled } from "@/lib/features";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateAr } from "@/lib/utils";
import { ArrowRight, CalendarDays, BookOpen } from "lucide-react";
import type { BlogPost, BlogContent } from "@/types/database";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title, excerpt")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!data) return { title: "المقال غير موجود" };

  return {
    title: data.title,
    description: data.excerpt ?? undefined,
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const enabled = await isFeatureEnabled("blog");
  if (!enabled) {
    return (
      <div className="mx-auto max-w-2xl pt-8">
        <Card className="text-center py-10">
          <BookOpen className="mx-auto h-10 w-10 text-muted mb-3" />
          <p className="text-muted text-sm">المدونة غير متاحة حالياً.</p>
        </Card>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_published", true)
    .single();

  if (!post) notFound();

  const raw = post.content;
  const content: BlogContent =
    typeof raw === "string" ? (JSON.parse(raw) as BlogContent) : (raw as BlogContent);

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-6"
      >
        <ArrowRight className="h-4 w-4" />
        العودة إلى المدونة
      </Link>

      <article>
        <div className="flex items-center gap-2 text-xs text-muted mb-3">
          <CalendarDays className="h-3.5 w-3.5" />
          {post.published_at ? (
            <span>
              {formatDateAr(new Date(post.published_at), {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          ) : null}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
          {post.title}
        </h1>

        {post.excerpt ? (
          <p className="mt-3 text-base text-muted leading-relaxed">{post.excerpt}</p>
        ) : null}

        <div className="mt-8 space-y-6">
          {content.sections?.map((s, i) => (
            <section key={i}>
              {s.title ? (
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{s.title}</h2>
              ) : null}
              {s.body ? (
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{s.body}</p>
              ) : null}
              {s.items ? (
                <ul className="mr-5 space-y-1.5 mt-2">
                  {s.items.map((item, j) => (
                    <li key={j} className="text-sm text-slate-600 dark:text-slate-300 list-disc">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          {content.allowedTable && content.allowedTable.length > 0 ? (
            <Card className="!p-0 overflow-hidden border-emerald-200 dark:border-emerald-900">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 px-5 py-3 border-b border-emerald-200 dark:border-emerald-900">
                <h3 className="font-bold text-emerald-700 dark:text-emerald-400">✅ مسموح</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <th className="px-5 py-3 text-right font-medium text-slate-500">الفئة</th>
                      <th className="px-5 py-3 text-right font-medium text-slate-500">أمثلة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.allowedTable.map((row, i) => (
                      <tr key={i} className="border-b border-slate-50 dark:border-slate-800 last:border-0">
                        <td className="px-5 py-3 font-medium text-slate-800 dark:text-white">{row.category}</td>
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{row.items}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}

          {content.prohibitedTable && content.prohibitedTable.length > 0 ? (
            <Card className="!p-0 overflow-hidden border-red-200 dark:border-red-900">
              <div className="bg-red-50 dark:bg-red-950/30 px-5 py-3 border-b border-red-200 dark:border-red-900">
                <h3 className="font-bold text-red-600 dark:text-red-400">❌ ممنوع</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700">
                      <th className="px-5 py-3 text-right font-medium text-slate-500">الفئة</th>
                      <th className="px-5 py-3 text-right font-medium text-slate-500">أمثلة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.prohibitedTable.map((row, i) => (
                      <tr key={i} className="border-b border-slate-50 dark:border-slate-800 last:border-0">
                        <td className="px-5 py-3 font-medium text-slate-800 dark:text-white">{row.category}</td>
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{row.items}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}

          {content.intervalChart && content.intervalChart.length > 0 ? (
            <Card>
              <h3 className="font-bold text-slate-800 dark:text-white mb-3">⏰ فترات الوجبات</h3>
              <div className="space-y-2">
                {content.intervalChart.map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3"
                  >
                    <span className="text-sm text-slate-600 dark:text-slate-300">{row.label}</span>
                    <span className="text-sm font-bold text-primary">{row.hours} ساعة</span>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      </article>

      <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
        <Link href="/blog">
          <Button variant="outline" size="sm">
            <ArrowRight className="h-4 w-4" />
            جميع المقالات
          </Button>
        </Link>
      </div>
    </div>
  );
}
