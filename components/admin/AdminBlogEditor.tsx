"use client";

import { useState, useTransition } from "react";
import { saveBlogPostAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { BlogPost } from "@/types/database";

const DEFAULT_CONTENT = {
  sections: [
    {
      type: "text",
      title: "مرحباً بنظام الطيبات",
      body: "نظام غذائي متكامل للدكتور ضياء العوضي يركز على التوقيت والنوعية.",
    },
  ],
  allowedTable: [
    { category: "نشويات", items: "أرز، بطاطا، شوفان" },
    { category: "لحوم", items: "دجاج، لحم أحمر، سمك" },
  ],
  prohibitedTable: [
    { category: "ألبان", items: "حليب، لبن، جبنة صفراء" },
    { category: "بقوليات", items: "عدس، حمص، فول" },
  ],
  intervalChart: [
    { label: "بين الوجبات", hours: 4 },
    { label: "الحد الأدنى الموصى", hours: 4 },
  ],
};

interface AdminBlogEditorProps {
  posts: BlogPost[];
}

export function AdminBlogEditor({ posts }: AdminBlogEditorProps) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [editId, setEditId] = useState<string | undefined>();

  const editing = posts.find((p) => p.id === editId);

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 font-bold">{editing ? "تعديل مقال" : "مقال جديد"}</h2>
        <form
          action={(fd) => {
            start(async () => {
              const r = await saveBlogPostAction({}, fd);
              setMsg(r.error ?? (r.success ? "تم الحفظ" : null));
              if (r.success) setEditId(undefined);
            });
          }}
          className="space-y-4"
        >
          {editId ? <input type="hidden" name="id" value={editId} /> : null}
          <Input name="slug" label="المعرّف (slug)" defaultValue={editing?.slug ?? "tayyibat-intro"} required />
          <Input name="title" label="العنوان" defaultValue={editing?.title ?? "مقدمة نظام الطيبات"} required />
          <Input name="excerpt" label="مقتطف" defaultValue={editing?.excerpt ?? ""} />
          <div>
            <label className="mb-1 block text-sm font-medium">المحتوى (JSON)</label>
            <textarea
              name="content"
              rows={14}
              defaultValue={JSON.stringify(editing?.content ?? DEFAULT_CONTENT, null, 2)}
              className="w-full rounded-lg border font-mono text-xs dark:border-slate-600 dark:bg-slate-800"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isPublished" defaultChecked={editing?.is_published ?? true} />
            منشور
          </label>
          <Button type="submit" isLoading={pending}>حفظ المقال</Button>
        </form>
        {msg ? <p className="mt-2 text-sm text-emerald-600">{msg}</p> : null}
      </Card>

      <Card>
        <h2 className="mb-4 font-bold">المقالات</h2>
        <ul className="space-y-2">
          {posts.map((p) => (
            <li key={p.id} className="flex justify-between text-sm">
              <span>{p.title}</span>
              <Button variant="ghost" size="sm" onClick={() => setEditId(p.id)}>
                تعديل
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
