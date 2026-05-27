"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { registerAction, verifyOtpAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";
import type { AuthFormState } from "@/types";

const initialState: AuthFormState = {};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" isLoading={pending} disabled={pending}>
      {label}
    </Button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useFormState(registerAction, initialState);
  const [otpState, otpFormAction] = useFormState(verifyOtpAction, initialState);
  const [showOtp, setShowOtp] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  useEffect(() => {
    if (state.success) setShowOtp(true);
  }, [state.success]);

  const displayOtp = showOtp;

  return (
    <Card className="w-full max-w-md">
      <CardHeader
        title="إنشاء حساب"
        description="انضم لنبض الطيبات لمتابعة التزامك"
      />

      {!displayOtp ? (
        <form
          action={(fd) => {
            const email = fd.get("email");
            if (typeof email === "string") setRegisteredEmail(email);
            return formAction(fd);
          }}
          className="space-y-4"
          noValidate
        >
          {(state.error ?? otpState.error) ? (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
              {state.error ?? otpState.error}
            </div>
          ) : null}

          {state.success ? (
            <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
              {state.success}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => setShowOtp(true)}
              >
                إدخال رمز OTP
              </Button>
            </div>
          ) : null}

          <Input
            name="fullName"
            type="text"
            label="الاسم (اختياري)"
            autoComplete="name"
          />

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
            autoComplete="new-password"
            required
            minLength={8}
            hint="8 أحرف على الأقل، حرف ورقم"
            dir="ltr"
            className="text-left"
          />

          <SubmitButton label="إنشاء الحساب" />
        </form>
      ) : (
        <form action={otpFormAction} className="space-y-4" noValidate>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            أدخل رمز التحقق المرسل إلى بريدك
          </p>

          {otpState.error ? (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {otpState.error}
            </div>
          ) : null}

          <Input
            name="email"
            type="email"
            label="البريد الإلكتروني"
            defaultValue={registeredEmail}
            required
            dir="ltr"
            className="text-left"
          />

          <Input
            name="token"
            type="text"
            label="رمز OTP"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            dir="ltr"
            className="text-left tracking-widest"
            placeholder="123456"
          />

          <SubmitButton label="تأكيد الرمز" />
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        لديك حساب؟{" "}
        <Link
          href="/login"
          className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          تسجيل الدخول
        </Link>
      </p>
    </Card>
  );
}
