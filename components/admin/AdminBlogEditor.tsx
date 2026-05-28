"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  saveBlogPostAction,
  deleteBlogPostAction,
  toggleBlogPublishAction,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import type { BlogPost } from "@/types/database";

const DEFAULT_CONTENT = {
  sections: [
    {
      type: "text",
      title: "عنوان القسم",
      body: "محتوى القسم...",
    },
  ],
  allowedTable: [
    { category: "", items: "" },
  ],
  prohibitedTable: [
    { category: "", items: "" },
  ],
  intervalChart: [
    { label: "", hours: 4 },
  ],
};

interface AdminBlogEditorProps {
  posts: BlogPost[];
}

export function AdminBlogEditor({ posts }: AdminBlogEditorProps) {
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [pending, start] = useTransition();
  const [editId, setEditId] = useState<string | undefined>();
  const [showForm, setShowForm] = useState(false);

  const editing = editId ? posts.find((p) => p.id === editId) : null;

  const showMsg = (text: string, type: "success" | "error") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleSave = (fd: FormData) => {
    start(async () => {
      const r = await saveBlogPostAction({}, fd);
      if (r.success) {
        showMsg("تم حفظ المقال بنجاح", "success");
        setEditId(undefined);
        setShowForm(false);
      } else {
        showMsg(r.error ?? "حدث خطأ", "error");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("هل أنت متأكد من حذف المقال؟")) return;
    const fd = new FormData();
    fd.set("id", id);
    start(async () => {
      const r = await deleteBlogPostAction({}, fd);
      if (r.success) {
        showMsg("تم حذف المقال", "success");
        if (editId === id) {
          setEditId(undefined);
          setShowForm(false);
        }
      } else {
        showMsg(r.error ?? "تعذر الحذف", "error");
      }
    });
  };

  const handleTogglePublish = (post: BlogPost) => {
    const fd = new FormData();
    fd.set("id", post.id);
    fd.set("published", String(!post.is_published));
    start(async () => {
      const r = await toggleBlogPublishAction({}, fd);
      if (r.success) {
        showMsg(post.is_published ? "تم إلغاء النشر" : "تم النشر", "success");
      } else {
        showMsg(r.error ?? "تعذر التحديث", "error");
      }
    });
  };

  const openNew = () => {
    setEditId(undefined);
    setShowForm(true);
  };

  const openEdit = (id: string) => {
    setEditId(id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-800 dark:text-white">
          المقالات ({posts.length})
        </h2>
        <Button onClick={openNew} size="sm" disabled={showForm && !editId}>
          <Plus className="h-4 w-4" />
          إضافة مقال جديد
        </Button>
      </div>

      <AnimatePresence>
        {showForm ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Card className="border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white">
                    {editing ? "تعديل المقال" : "مقال جديد"}
                  </h3>
                </div>
                <button
                  onClick={() => { setShowForm(false); setEditId(undefined); }}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form action={handleSave} className="space-y-4">
                {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

                <Input
                  name="slug"
                  label="المعرّف (slug)"
                  defaultValue={editing?.slug ?? ""}
                  required
                  placeholder="مثال: tayyibat-intro"
                />
                <Input
                  name="title"
                  label="العنوان"
                  defaultValue={editing?.title ?? ""}
                  required
                  placeholder="العنوان الرئيسي للمقال"
                />
                <Input
                  name="excerpt"
                  label="العنوان الفرعي (excerpt)"
                  defaultValue={editing?.excerpt ?? ""}
                  placeholder="وصف مختصر للمقال"
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
                    المحتوى (JSON)
                  </label>
                  <textarea
                    name="content"
                    rows={14}
                    defaultValue={
                      editing
                        ? JSON.stringify(editing.content, null, 2)
                        : JSON.stringify(DEFAULT_CONTENT, null, 2)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 font-mono text-xs leading-relaxed text-slate-900 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 transition-all"
                  />
                </div>

                <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    name="isPublished"
                    defaultChecked={editing?.is_published ?? true}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                  />
                  منشور
                </label>

                {msg ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-sm ${msg.type === "success" ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {msg.text}
                  </motion.p>
                ) : null}

                <div className="flex gap-2">
                  <Button type="submit" isLoading={pending}>
                    <Check className="h-4 w-4" />
                    {editing ? "حفظ التعديلات" : "نشر المقال"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { setShowForm(false); setEditId(undefined); }}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {posts.length === 0 && !showForm ? (
        <Card className="text-center py-12">
          <BookOpen className="mx-auto h-10 w-10 text-muted mb-3" />
          <p className="text-muted text-sm mb-4">لا توجد مقالات بعد</p>
          <Button onClick={openNew} size="sm">
            <Plus className="h-4 w-4" />
            إضافة أول مقال
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                      {post.title}
                    </p>
                    {post.is_published ? (
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                        منشور
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
                        مسودة
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-0.5">{post.slug}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(post)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    aria-label={post.is_published ? "إلغاء النشر" : "نشر"}
                  >
                    {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => openEdit(post.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors"
                    aria-label="تعديل"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    aria-label="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
