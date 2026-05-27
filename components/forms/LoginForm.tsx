"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-sm"
    >
      <Card>
        <CardHeader title="تسجيل الدخول" description="أهلاً بعودتك إلى نبض الطيبات" />

        <form action={formAction} className="space-y-4" noValidate>
          {state.error ? (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400"
            >
              {state.error}
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

        <p className="mt-6 text-center text-sm text-muted">
          ليس لديك حساب؟{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:text-primary-light transition-colors"
          >
            إنشاء حساب
          </Link>
        </p>
      </Card>
    </motion.div>
  );
}
