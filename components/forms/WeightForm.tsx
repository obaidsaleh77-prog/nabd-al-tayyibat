"use client";

import { useFormState, useFormStatus } from "react-dom";
import { logWeightAction, type WeightActionState } from "@/app/actions/weight";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: WeightActionState = {};

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} size="sm">
      {label}
    </Button>
  );
}

interface WeightFormProps {
  isDailyBaseline?: boolean;
  compact?: boolean;
}

export function WeightForm({ isDailyBaseline = false, compact = false }: WeightFormProps) {
  const [state, action] = useFormState(logWeightAction, initial);

  return (
    <form action={action} className={compact ? "flex flex-wrap items-end gap-2" : "space-y-4"}>
      {state.error ? <p role="alert" className="w-full text-sm text-red-600">{state.error}</p> : null}
      {state.success ? <p role="status" className="w-full text-sm text-emerald-600">تم الحفظ</p> : null}

      <input type="hidden" name="isDailyBaseline" value={String(isDailyBaseline)} />
      <Input
        name="weightKg"
        type="number"
        step="0.1"
        label={compact ? undefined : "الوزن (كغ)"}
        placeholder="مثال: 75.5"
        required
        min={20}
        max={500}
        className={compact ? "max-w-[120px]" : undefined}
      />
      <SubmitBtn label={isDailyBaseline ? "تسجيل وزن اليوم" : "حفظ"} />
    </form>
  );
}
