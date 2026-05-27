"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";
import type { AuthFormState } from "@/types";

const initialState: AuthFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" isLoading={pending} disabled={pending}>
      تسجيل الدخول
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <Card className="w-full max-w-md">
      <CardHeader
        title="تسجيل الدخول"
        description="أدخل بريدك وكلمة المرور للمتابعة"
      />

      <form action={formAction} className="space-y-4" noValidate>
        {state.error ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300"
          >
            {state.error}
          </div>
        ) : null}

        {state.success ? (
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
          >
            {state.success}
          </div>
        ) : null}

        <Input
          name="email"
          type="email"
          label="البريد الإلكتروني"
          autoComplete="email"
          required
          dir="ltr"
          className="text-left"
        />

        <Input
          name="password"
          type="password"
          label="كلمة المرور"
          autoComplete="current-password"
          required
          minLength={8}
          dir="ltr"
          className="text-left"
        />

        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        ليس لديك حساب؟{" "}
        <Link
          href="/register"
          className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          إنشاء حساب
        </Link>
      </p>
    </Card>
  );
}
