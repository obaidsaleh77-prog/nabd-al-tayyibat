import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** دمج فئات Tailwind بأمان */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** تنسيق التاريخ بالعربية */
export function formatDateAr(
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat("ar-SA", {
    calendar: "gregory",
    ...options,
  }).format(date);
}

/** تنسيق الأرقام بالعربية */
export function formatNumberAr(value: number): string {
  return new Intl.NumberFormat("ar-SA").format(value);
}

/** الحصول على عنوان IP من رؤوس الطلب (للموافقة) */
export function getClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    return first ?? null;
  }
  return headers.get("x-real-ip");
}
