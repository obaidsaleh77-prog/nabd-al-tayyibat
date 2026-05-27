import type { Metadata } from "next";
import { getAdminBlogPosts } from "@/app/actions/admin";
import { AdminBlogEditor } from "@/components/admin/AdminBlogEditor";
import type { BlogPost } from "@/types/database";

export const metadata: Metadata = { title: "إدارة المحتوى" };

export default async function AdminContentPage() {
  const posts = await getAdminBlogPosts();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">إدارة المدونة</h1>
      <AdminBlogEditor posts={posts as BlogPost[]} />
    </div>
  );
}
