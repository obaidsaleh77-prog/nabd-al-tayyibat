import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireConsent } from "@/app/actions/consent";
import { getFeatureFlagsMap } from "@/lib/features";
import { DashboardShellClient } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
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

  const enabledFlags = await getFeatureFlagsMap();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";

  return (
    <DashboardShellClient enabledFlags={enabledFlags} isAdmin={isAdmin}>{children}</DashboardShellClient>
  );
}
