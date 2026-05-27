"use client";

import { useState, useTransition } from "react";
import {
  withdrawConsentFromSettingsAction,
  deleteAccountAction,
} from "@/app/actions/account";
import { Button } from "@/components/ui/button";

export function SettingsActions() {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleWithdraw = () => {
    if (!confirm("سحب الموافقة سيُنهي جلستك ويمنع استخدام التطبيق. متابعة؟")) return;
    startTransition(async () => {
      const result = await withdrawConsentFromSettingsAction();
      if (result.error) setMessage(result.error);
    });
  };

  const handleDelete = () => {
    if (
      !confirm(
        "حذف نهائي للحساب وجميع البيانات. لا يمكن التراجع. هل أنت متأكد؟"
      )
    )
      return;
    startTransition(async () => {
      const result = await deleteAccountAction();
      if (result?.error) setMessage(result.error);
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {message ? <p role="alert" className="w-full text-sm text-red-600">{message}</p> : null}
      <Button
        variant="outline"
        onClick={handleWithdraw}
        disabled={isPending}
        aria-label="سحب الموافقة"
      >
        سحب الموافقة
      </Button>
      <Button
        variant="danger"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="حذف الحساب نهائياً"
      >
        حذف حسابي وبياناتي نهائياً
      </Button>
    </div>
  );
}
