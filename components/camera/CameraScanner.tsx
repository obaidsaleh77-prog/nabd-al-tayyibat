"use client";

import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Camera, Scan } from "lucide-react";
import { validateOcrTextAction } from "@/app/actions/rules";
import type { IngredientMatchResult, ValidationSummary } from "@/lib/rules/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const DISCLAIMER =
  "نتائج استرشادية ولا تغني عن قراءة الملصق الغذائي الأصلي";

function ResultBadge({ result }: { result: IngredientMatchResult }) {
  const styles =
    result.status === "allowed"
      ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50"
      : result.status === "prohibited"
        ? "border-red-300 bg-red-50 text-red-800 dark:bg-red-950/50"
        : "border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/50";

  const icon =
    result.status === "allowed" ? "✅" : result.status === "prohibited" ? "❌" : "⚠️";

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

  const captureAndScan = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      setError("تعذر التقاط الصورة");
      return;
    }

    setScanning(true);
    setError(null);

    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("ara");
      const { data } = await worker.recognize(imageSrc);
      await worker.terminate();

      const text = data.text;
      setOcrText(text);
      const validationResult = await validateOcrTextAction(text);
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
            videoConstraints={{ facingMode: "environment" }}
            className="w-full"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={captureAndScan} isLoading={scanning} disabled={scanning}>
            <Scan className="h-4 w-4" />
            مسح الملصق
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
