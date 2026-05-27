"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { acceptDisclaimerAction } from "@/app/actions/consent";
import { Button } from "@/components/ui/button";
import { DISCLAIMER_VERSION } from "@/lib/constants";
import type { ConsentFormState } from "@/types";

const initialState: ConsentFormState = {};

/** نص الإقرار — الإصدار يُسجّل في قاعدة البيانات */
const DISCLAIMER_TEXT = `
إخلاء مسؤولية — نبض الطيبات

هذا التطبيق أداة تتبع وتعليمية لمتابعة الالتزام بنظام «الطيبات» للدكتور ضياء العوضي.
لا يُعدّ بديلاً عن الاستشارة الطبية أو التشخيص أو وصف الأدوية.

• المحتوى والنتائج استرشادية ولا تغني عن قراءة الملصق الغذائي أو استشارة مختص معتمد.
• أنت المسؤول عن قراراتك الصحية والغذائية.
• البيانات الصحية تُخزَّن بشكل آمن وفق سياسة الخصوصية.

بالموافقة أنت تقر بقراءة هذا النص وإصدارها: ${DISCLAIMER_VERSION}.
`.trim();

export function DisclaimerForm() {
  const [state, formAction] = useFormState(acceptDisclaimerAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      router.push("/");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div className="space-y-6">
      <div
        className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-700 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-300"
        tabIndex={0}
        role="document"
        aria-label="نص إخلاء المسؤولية"
      >
        {DISCLAIMER_TEXT.split("\n").map((line, i) => (
          <p key={i} className={line.startsWith("•") ? "mr-4" : "mb-2"}>
            {line}
          </p>
        ))}
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <form action={formAction} className="space-y-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            name="accepted"
            value="true"
            required
            className="mt-1 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            aria-describedby="consent-hint"
          />
          <span id="consent-hint" className="text-sm text-slate-700 dark:text-slate-300">
            قرأت وأوافق على إخلاء المسؤولية أعلاه (الإصدار {DISCLAIMER_VERSION})
          </span>
        </label>

        <Button type="submit" className="w-full">
          أوافق وأتابع
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500">
        بدون الموافقة لا يمكنك استخدام التطبيق. يمكنك سحب الموافقة لاحقاً من الإعدادات.
      </p>
    </div>
  );
}
