"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addMealAction, type MealActionState } from "@/app/actions/meals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const initial: MealActionState = {};

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full">
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
    <Card>
      <h2 className="mb-4 text-lg font-bold">إضافة وجبة</h2>
      <form action={action} className="space-y-4">
        {state.error ? (
          <p role="alert" className="text-sm text-red-600">{state.error}</p>
        ) : null}
        {state.success ? (
          <p role="status" className="text-sm text-emerald-600">تم حفظ الوجبة بنجاح</p>
        ) : null}

        <Input
          name="startedAt"
          type="datetime-local"
          label="وقت البداية"
          defaultValue={localStart}
          required
        />
        <Input name="endedAt" type="datetime-local" label="وقت النهاية (اختياري)" />
        <div>
          <label htmlFor="ingredients" className="mb-1 block text-sm font-medium">
            المكونات (افصل بفاصلة)
          </label>
          <textarea
            id="ingredients"
            name="ingredients"
            rows={3}
            required
            placeholder="مثال: أرز، دجاج، زيت زيتون"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
          />
        </div>
        <Input name="notes" label="ملاحظات (اختياري)" />
        <SubmitBtn />
      </form>
    </Card>
  );
}
