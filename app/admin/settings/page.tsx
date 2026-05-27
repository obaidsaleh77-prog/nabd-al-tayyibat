import type { Metadata } from "next";
import { getAdminSettings } from "@/app/actions/admin";
import { AdminSettingsForm } from "@/components/admin/AdminSettingsForm";

export const metadata: Metadata = { title: "إعدادات الأدمن" };

export default async function AdminSettingsPage() {
  const { settings, flags } = await getAdminSettings();

  const weightsRow = settings.find((s) => s.key === "compliance_weights");
  const weights = (weightsRow?.value as { diet?: number; intervals?: number; logging?: number }) ?? {
    diet: 40,
    intervals: 30,
    logging: 30,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">إعدادات النظام</h1>
      <AdminSettingsForm
        weights={{
          diet: weights.diet ?? 40,
          intervals: weights.intervals ?? 30,
          logging: weights.logging ?? 30,
        }}
        flags={flags}
      />
    </div>
  );
}
