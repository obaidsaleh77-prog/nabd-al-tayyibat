/** إصدار نص الإقرار الحالي */
export const DISCLAIMER_VERSION =
  process.env.NEXT_PUBLIC_DISCLAIMER_VERSION ?? "1.0.0";

export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME ?? "نبض الطيبات";

/** مسارات عامة لا تتطلب مصادقة */
export const PUBLIC_ROUTES = ["/login", "/register", "/disclaimer"] as const;

/** مسارات تتطلب مصادقة */
export const AUTH_ROUTES = [
  "/",
  "/meals",
  "/weight",
  "/health-status",
  "/ai-chat",
  "/blog",
  "/camera",
] as const;

/** مسارات الأدمن */
export const ADMIN_ROUTES = ["/admin", "/admin/settings", "/admin/content"] as const;

/** خيارات الحالة المرضية */
export const MEDICAL_CONDITION_OPTIONS = [
  "سكري",
  "ضغط",
  "قلب",
  "كلى",
  "حساسية",
  "أخرى",
] as const;
