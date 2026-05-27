"use client";

import { useState, useTransition } from "react";
import {
  updateComplianceWeightsAction,
  toggleFeatureFlagAction,
  saveRulesVersionAction,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import rulesJson from "@/lib/rules/tayyibat_rules.json";

interface AdminSettingsFormProps {
  weights: { diet: number; intervals: number; logging: number };
  flags: Array<{ flag_key: string; is_enabled: boolean; description: string | null }>;
}

export function AdminSettingsForm({ weights, flags }: AdminSettingsFormProps) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="mb-4 font-bold">معادلة الالتزام (المجموع = 100)</h2>
        <form
          action={(fd) => {
            start(async () => {
              const r = await updateComplianceWeightsAction({}, fd);
              setMsg(r.error ?? (r.success ? "تم الحفظ" : null));
            });
          }}
          className="grid gap-4 sm:grid-cols-3"
        >
          <Input name="diet" type="number" label="غذائي %" defaultValue={weights.diet} required />
          <Input name="intervals" type="number" label="فترات %" defaultValue={weights.intervals} required />
          <Input name="logging" type="number" label="تسجيل %" defaultValue={weights.logging} required />
          <Button type="submit" isLoading={pending}>حفظ الأوزان</Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 font-bold">تفعيل الميزات</h2>
        <ul className="space-y-3">
          {flags.map((f) => (
            <li key={f.flag_key} className="flex items-center justify-between">
              <span className="text-sm">{f.description ?? f.flag_key}</span>
              <Button
                variant={f.is_enabled ? "primary" : "outline"}
                size="sm"
                disabled={pending}
                onClick={() => {
                  start(async () => {
                    await toggleFeatureFlagAction(f.flag_key, !f.is_enabled);
                  });
                }}
              >
                {f.is_enabled ? "مفعّل" : "معطّل"}
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-4 font-bold">قواعد المسموح/الممنوع (JSON)</h2>
        <form
          action={(fd) => {
            start(async () => {
              const r = await saveRulesVersionAction({}, fd);
              setMsg(r.error ?? (r.success ? "تم حفظ نسخة القواعد" : null));
            });
          }}
          className="space-y-3"
        >
          <Input name="versionLabel" label="رمز النسخة" defaultValue="1.0.1" />
          <textarea
            name="rulesJson"
            rows={12}
            defaultValue={JSON.stringify(rulesJson, null, 2)}
            className="w-full rounded-lg border border-slate-300 font-mono text-xs dark:border-slate-600 dark:bg-slate-800"
          />
          <Button type="submit" isLoading={pending}>حفظ القواعد</Button>
        </form>
      </Card>

      {msg ? <p className="text-sm text-emerald-600">{msg}</p> : null}
    </div>
  );
}
