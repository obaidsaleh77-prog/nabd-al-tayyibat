import type { Metadata } from "next";
import { Camera } from "lucide-react";
import { isFeatureEnabled } from "@/lib/features";
import { CameraScanner } from "@/components/camera/CameraScanner";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "كاميرا نبض الطيبات" };

export default async function CameraPage() {
  const enabled = await isFeatureEnabled("camera_ocr");
  if (!enabled) {
    return (
      <div className="mx-auto max-w-2xl pt-8">
        <Card className="text-center py-10">
          <Camera className="mx-auto h-10 w-10 text-muted mb-3" />
          <p className="text-muted">الكاميرا معطّلة حالياً من قبل الإدارة.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">كاميرا نبض الطيبات</h1>
        <p className="text-sm text-muted">صوّر ملصق الطعام لتحليل مكوناته</p>
      </div>
      <CameraScanner />
    </div>
  );
}
