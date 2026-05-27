"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { motion } from "framer-motion";
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

  const errMsg = state.error ?? otpState.error;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-sm"
    >
      <Card>
        <CardHeader title="إنشاء حساب" description="انضم لنبض الطيبات لمتابعة التزامك" />

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
            {errMsg ? (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400"
              >
                {errMsg}
              </motion.div>
            ) : null}

            {state.success ? (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                role="status"
                className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
              >
                {state.success}
              </motion.div>
            ) : null}

            <Input name="fullName" type="text" label="الاسم (اختياري)" autoComplete="name" />
            <Input name="email" type="email" label="البريد الإلكتروني" autoComplete="email" required dir="ltr" className="text-left" />
            <Input name="password" type="password" label="كلمة المرور" autoComplete="new-password" required minLength={8} hint="8 أحرف على الأقل، حرف ورقم" dir="ltr" className="text-left" />

            {state.success ? (
              <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setShowOtp(true)}>
                إدخال رمز التحقق
              </Button>
            ) : (
              <SubmitButton label="إنشاء الحساب" />
            )}
          </form>
        ) : (
          <form action={otpFormAction} className="space-y-4" noValidate>
            <p className="text-sm text-muted">أدخل رمز التحقق المرسل إلى بريدك</p>

            {otpState.error ? (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400"
              >
                {otpState.error}
              </motion.div>
            ) : null}

            <Input name="email" type="email" label="البريد الإلكتروني" defaultValue={registeredEmail} required dir="ltr" className="text-left" />
            <Input name="token" type="text" label="رمز التحقق" inputMode="numeric" autoComplete="one-time-code" required dir="ltr" className="text-left tracking-widest text-center" placeholder="123456" />

            <SubmitButton label="تأكيد الرمز" />
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          لديك حساب؟{" "}
          <Link href="/login" className="font-medium text-primary hover:text-primary-light transition-colors">
            تسجيل الدخول
          </Link>
        </p>
      </Card>
    </motion.div>
  );
}
