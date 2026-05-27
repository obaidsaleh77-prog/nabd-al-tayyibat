import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireConsent } from "@/app/actions/consent";

/** حماية مسارات الأدمن — RBAC + موافقة */
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await requireConsent();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return <div className="min-h-screen bg-slate-100 dark:bg-slate-900">{children}</div>;
}
