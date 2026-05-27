"use client";

import { useFormState, useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { logWeightAction, type WeightActionState } from "@/app/actions/weight";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scale } from "lucide-react";

const initial: WeightActionState = {};

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} size="sm">
      <Scale className="h-4 w-4" />
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
      {state.error ? (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="alert" className="w-full rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {state.error}
        </motion.p>
      ) : null}
      {state.success ? (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} role="status" className="w-full rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
          تم الحفظ ✓
        </motion.p>
      ) : null}

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
        className={compact ? "max-w-[140px]" : undefined}
      />
      <SubmitBtn label={isDailyBaseline ? "تسجيل وزن اليوم" : "حفظ"} />
    </form>
  );
}
