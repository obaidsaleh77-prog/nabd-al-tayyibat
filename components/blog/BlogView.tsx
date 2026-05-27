import { Card } from "@/components/ui/card";
import { formatDateAr } from "@/lib/utils";
import type { BlogPost, BlogContent } from "@/types/database";

interface BlogViewProps {
  posts: BlogPost[];
}

export function BlogView({ posts }: BlogViewProps) {
  if (posts.length === 0) {
    return (
      <Card>
        <p className="text-slate-500">لا توجد مقالات منشورة بعد.</p>
      </Card>
    );
  }

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="space-y-8">
      {featured ? <BlogHero post={featured} /> : null}

      <div className="grid gap-6 sm:grid-cols-2">
        {rest.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

function BlogHero({ post }: { post: BlogPost }) {
  const content = post.content as BlogContent;

  return (
    <section
      className="overflow-hidden rounded-2xl bg-gradient-to-l from-emerald-700 to-emerald-500 p-8 text-white shadow-lg"
      aria-labelledby="blog-hero-title"
    >
      <p className="text-sm text-emerald-100">نبض الطيبات — مدونة تعليمية</p>
      <h1 id="blog-hero-title" className="mt-2 text-3xl font-bold">
        {post.title}
      </h1>
      {post.excerpt ? <p className="mt-3 max-w-2xl text-emerald-50">{post.excerpt}</p> : null}
      {post.published_at ? (
        <p className="mt-4 text-xs text-emerald-200">
          {formatDateAr(new Date(post.published_at), { dateStyle: "long" })}
        </p>
      ) : null}
      <BlogContentBlocks content={content} light />
    </section>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Card>
      <h2 className="text-lg font-bold">{post.title}</h2>
      {post.excerpt ? <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p> : null}
      <BlogContentBlocks content={post.content as BlogContent} />
    </Card>
  );
}

function BlogContentBlocks({
  content,
  light = false,
}: {
  content: BlogContent;
  light?: boolean;
}) {
  return (
    <div className={`mt-4 space-y-4 ${light ? "text-emerald-50" : ""}`}>
      {content.sections?.map((s, i) => (
        <div key={i}>
          {s.title ? <h3 className="font-semibold">{s.title}</h3> : null}
          {s.body ? <p className="text-sm">{s.body}</p> : null}
          {s.items ? (
            <ul className="mr-4 list-disc text-sm">
              {s.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}

      {content.allowedTable && content.allowedTable.length > 0 ? (
        <RulesTable title="مسموح" rows={content.allowedTable} variant="allowed" light={light} />
      ) : null}

      {content.prohibitedTable && content.prohibitedTable.length > 0 ? (
        <RulesTable title="ممنوع" rows={content.prohibitedTable} variant="prohibited" light={light} />
      ) : null}

      {content.intervalChart && content.intervalChart.length > 0 ? (
        <div>
          <h3 className="font-semibold">فترات الوجبات</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {content.intervalChart.map((row, i) => (
              <li key={i}>
                {row.label}: {row.hours} ساعة
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function RulesTable({
  title,
  rows,
  variant,
  light,
}: {
  title: string;
  rows: Array<{ category: string; items: string }>;
  variant: "allowed" | "prohibited";
  light?: boolean;
}) {
  const border = variant === "allowed" ? "border-emerald-400" : "border-red-400";

  return (
    <div className="overflow-x-auto">
      <h3 className="mb-2 font-semibold">{title}</h3>
      <table className={`w-full text-sm ${light ? "text-white" : ""}`}>
        <thead>
          <tr className={light ? "border-b border-emerald-400/50" : "border-b"}>
            <th className="py-2 text-right">الفئة</th>
            <th className="py-2 text-right">أمثلة</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`border-b ${border}/30`}>
              <td className="py-2 font-medium">{row.category}</td>
              <td className="py-2">{row.items}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
