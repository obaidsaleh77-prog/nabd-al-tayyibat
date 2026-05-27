"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addMealAction, type MealActionState } from "@/app/actions/meals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Utensils, Clock, FileText } from "lucide-react";

const initial: MealActionState = {};

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full">
      <Utensils className="h-4 w-4" />
      إضافة الوجبة
    </Button>
  );
}

export function MealForm() {
  const [state, action] = useFormState(addMealAction, initial);
  const now = new Date();
  const localStart = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <Card id="meal-form">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
          <Utensils className="h-4 w-4" />
        </div>
        <h2 className="text-base font-bold text-slate-800 dark:text-white">إضافة وجبة جديدة</h2>
      </div>
      <form action={action} className="space-y-4">
        {state.error ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400"
          >
            {state.error}
          </motion.p>
        ) : null}
        {state.success ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            role="status"
            className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
          >
            تم حفظ الوجبة بنجاح ✓
          </motion.p>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="meal-started" className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
              <Clock className="inline h-3.5 w-3.5 ml-1" />
              وقت البداية
            </label>
            <input
              id="meal-started"
              name="startedAt"
              type="datetime-local"
              defaultValue={localStart}
              required
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 transition-all"
            />
          </div>
          <div>
            <label htmlFor="meal-ended" className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
              <Clock className="inline h-3.5 w-3.5 ml-1" />
              وقت النهاية (اختياري)
            </label>
            <input
              id="meal-ended"
              name="endedAt"
              type="datetime-local"
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="ingredients" className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">
            <FileText className="inline h-3.5 w-3.5 ml-1" />
            المكونات (افصل بفاصلة)
          </label>
          <textarea
            id="ingredients"
            name="ingredients"
            rows={3}
            required
            placeholder="مثال: أرز، دجاج، زيت زيتون"
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder:text-slate-500 transition-all"
          />
        </div>

        <Input name="notes" label="ملاحظات (اختياري)" placeholder="أي ملاحظات إضافية..." />

        <SubmitBtn />
      </form>
    </Card>
  );
}
