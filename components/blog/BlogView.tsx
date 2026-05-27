import Link from "next/link";
import { BookOpen, CalendarDays, ChevronLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDateAr } from "@/lib/utils";
import type { BlogPost } from "@/types/database";

interface BlogViewProps {
  posts: BlogPost[];
}

export function BlogView({ posts }: BlogViewProps) {
  if (posts.length === 0) {
    return (
      <Card className="text-center py-12">
        <BookOpen className="mx-auto h-10 w-10 text-muted mb-3" />
        <p className="text-muted text-sm">لا توجد مقالات منشورة بعد.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, i) => (
        <Link key={post.id} href={`/blog/${post.slug}`}>
          <Card
            className={`p-5 hover:shadow-elevated transition-all duration-200 active:scale-[0.99] group ${
              i === 0 ? "gradient-primary text-white" : "bg-white dark:bg-slate-800"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs mb-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {post.published_at ? (
                    <span className={i === 0 ? "text-white/70" : "text-muted"}>
                      {formatDateAr(new Date(post.published_at), {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  ) : null}
                </div>
                <h2 className={`text-lg font-bold leading-snug ${i === 0 ? "text-white" : "text-slate-900 dark:text-white"}`}>
                  {post.title}
                </h2>
                {post.excerpt ? (
                  <p className={`mt-1.5 text-sm leading-relaxed line-clamp-2 ${i === 0 ? "text-white/80" : "text-muted"}`}>
                    {post.excerpt}
                  </p>
                ) : null}
              </div>
              <div
                className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
                  i === 0
                    ? "bg-white/20 text-white group-hover:bg-white/30"
                    : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-500 dark:group-hover:bg-slate-600"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
