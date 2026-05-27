import type { Metadata } from "next";
import { isFeatureEnabled } from "@/lib/features";
import { CameraScanner } from "@/components/camera/CameraScanner";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "كاميرا نبض الطيبات" };

export default async function CameraPage() {
  const enabled = await isFeatureEnabled("camera_ocr");
  if (!enabled) {
    return (
      <Card>
        <p className="text-slate-500">الكاميرا معطّلة حالياً من قبل الإدارة.</p>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">كاميرا نبض الطيبات</h1>
      <CameraScanner />
    </div>
  );
}
