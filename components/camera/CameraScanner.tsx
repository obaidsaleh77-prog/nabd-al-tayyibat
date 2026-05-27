"use client";

import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Camera, Scan, RotateCw } from "lucide-react";
import { validateOcrTextAction, analyzeImageWithAI } from "@/app/actions/rules";
import type { IngredientMatchResult, ValidationSummary } from "@/lib/rules/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const DISCLAIMER = "نتائج استرشادية ولا تغني عن قراءة الملصق الغذائي الأصلي";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("فشل تحميل الصورة"));
    img.src = src;
  });
}

async function resizeImage(src: string, maxDim: number, quality: number): Promise<string> {
  const img = await loadImage(src);
  const scale = maxDim / Math.max(img.width, img.height);
  if (scale >= 1) return src;
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

function cleanOcrText(text: string): string {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 1)
    .join(", ");
}

function ResultBadge({ result }: { result: IngredientMatchResult }) {
  const styles =
    result.status === "allowed"
      ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50"
      : result.status === "prohibited"
        ? "border-red-300 bg-red-50 text-red-800 dark:bg-red-950/50"
        : "border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/50";

  const icon = result.status === "allowed" ? "✅" : result.status === "prohibited" ? "❌" : "⚠️";

  return (
    <li className={`rounded-lg border px-3 py-2 text-sm ${styles}`}>
      <span aria-hidden="true">{icon} </span>
      <strong>{result.ingredient}</strong>
      {result.categoryName ? ` — ${result.categoryName}` : null}
      {result.matchedKeyword ? (
        <span className="block text-xs opacity-75">تطابق: {result.matchedKeyword}</span>
      ) : null}
    </li>
  );
}

export function CameraScanner() {
  const webcamRef = useRef<Webcam>(null);
  const [scanning, setScanning] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [results, setResults] = useState<ValidationSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const captureAndScan = useCallback(async () => {
    const rawImage = webcamRef.current?.getScreenshot({ width: 1920, height: 1080 });
    if (!rawImage) {
      setError("تعذر التقاط الصورة");
      return;
    }

    setScanning(true);
    setError(null);

    try {
      const smallImage = await resizeImage(rawImage, 1200, 0.8);

      let text = "";
      try {
        const aiResult = await analyzeImageWithAI(smallImage);
        text = aiResult.text;
      } catch (e) {
        console.warn("AI vision failed, falling back to Tesseract:", e);
      }

      if (!text.trim()) {
        const { createWorker } = await import("tesseract.js");
        const worker = await createWorker("ara+eng", 1);
        await worker.setParameters({ tessedit_pageseg_mode: "6" as any });
        const { data } = await worker.recognize(smallImage);
        await worker.terminate();
        text = data.text;
      }

      const cleaned = cleanOcrText(text);
      setOcrText(cleaned);

      if (!cleaned.trim()) {
        setError("لم يتم التعرف على أي نص. حاول إضاءة أفضل أو تصوير أقرب.");
        return;
      }

      const validationResult = await validateOcrTextAction(cleaned);
      setResults(validationResult);
    } catch (e) {
      console.error(e);
      setError("فشل التعرف على النص. حاول إضاءة أفضل أو قراءة يدوية.");
    } finally {
      setScanning(false);
    }
  }, []);

  const scanManualText = async () => {
    if (!ocrText.trim()) return;
    setScanning(true);
    setError(null);
    try {
      const validationResult = await validateOcrTextAction(ocrText);
      setResults(validationResult);
    } catch {
      setError("حدث خطأ أثناء تحليل النص.");
    } finally {
      setScanning(false);
    }
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <Camera className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          كاميرا نبض الطيبات
        </h2>

        <div className="relative overflow-hidden rounded-xl bg-black">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={1}
            videoConstraints={{ facingMode, width: 1920, height: 1080 }}
            className="w-full"
            minScreenshotWidth={1920}
            minScreenshotHeight={1080}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={captureAndScan} isLoading={scanning} disabled={scanning}>
            <Scan className="h-4 w-4" />
            مسح الملصق
          </Button>
          <Button variant="outline" onClick={toggleCamera} disabled={scanning}>
            <RotateCw className="h-4 w-4" />
            تبديل الكاميرا
          </Button>
        </div>

        {scanning ? <Spinner label="جاري تحليل النص..." /> : null}
        {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
      </Card>

      <Card>
        <label htmlFor="manual-ocr" className="mb-2 block text-sm font-medium">
          أو الصق النص يدوياً
        </label>
        <textarea
          id="manual-ocr"
          value={ocrText}
          onChange={(e) => setOcrText(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
          placeholder="نص الملصق الغذائي..."
        />
        <Button variant="outline" size="sm" className="mt-2" onClick={scanManualText}>
          تحليل النص
        </Button>
      </Card>

      {results ? (
        <Card>
          <h3 className="mb-3 font-bold">نتائج المطابقة</h3>
          <ul className="space-y-2" aria-label="نتائج المكونات">
            {[...results.violations, ...results.allowed, ...results.unclear].map(
              (r, i) => (
                <ResultBadge key={`${r.ingredient}-${i}`} result={r} />
              )
            )}
          </ul>
          {results.violations.length > 0 ? (
            <p className="mt-3 text-sm text-red-600">
              إجمالي الخصم التقديري: {results.totalPenalty}%
            </p>
          ) : null}
        </Card>
      ) : null}

      <p className="text-center text-xs text-amber-700 dark:text-amber-400" role="note">
        {DISCLAIMER}
      </p>
    </div>
  );
}
