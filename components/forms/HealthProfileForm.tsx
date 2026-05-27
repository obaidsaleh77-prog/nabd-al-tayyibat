"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveHealthProfileAction, type ProfileActionState } from "@/app/actions/profile";
import { MEDICAL_CONDITION_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { UserHealthProfile } from "@/types/database";

const initial: ProfileActionState = {};

function SubmitBtn() {
  const { pending } = useFormStatus();
  return <Button type="submit" isLoading={pending}>حفظ الملف الصحي</Button>;
}

interface HealthProfileFormProps {
  profile: UserHealthProfile | null;
}

export function HealthProfileForm({ profile }: HealthProfileFormProps) {
  const [state, action] = useFormState(saveHealthProfileAction, initial);
  const selected = new Set(profile?.medical_conditions ?? []);

  return (
    <Card>
      <h2 className="mb-2 text-lg font-bold">الملف الصحي (اختياري)</h2>
      <p className="mb-4 text-sm text-slate-500">جميع الحقول اختيارية</p>

      <form action={action} className="space-y-4">
        {state.error ? <p role="alert" className="text-sm text-red-600">{state.error}</p> : null}
        {state.success ? <p role="status" className="text-sm text-emerald-600">تم الحفظ</p> : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="heightCm"
            type="number"
            label="الطول (سم)"
            defaultValue={profile?.height_cm ?? ""}
            min={50}
            max={250}
          />
          <Input
            name="baselineWeightKg"
            type="number"
            step="0.1"
            label="الوزن الأساسي (كغ)"
            defaultValue={profile?.baseline_weight_kg ?? ""}
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">الحالة المرضية</legend>
          <div className="flex flex-wrap gap-3">
            {MEDICAL_CONDITION_OPTIONS.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="medicalConditions"
                  value={c}
                  defaultChecked={selected.has(c)}
                  className="rounded text-emerald-600"
                />
                {c}
              </label>
            ))}
          </div>
        </fieldset>

        <Input
          name="medicalConditionsOther"
          label="أخرى (حدد)"
          defaultValue={profile?.medical_conditions_other ?? ""}
        />

        <SubmitBtn />
      </form>
    </Card>
  );
}
