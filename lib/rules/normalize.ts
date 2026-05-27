/** إزالة التشكيل العربي */
const DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

/** توحيد أشكال الألف والياء */
export function normalizeArabic(text: string, ignoreDiacritics = true): string {
  let normalized = text.trim().toLowerCase();

  if (ignoreDiacritics) {
    normalized = normalized.replace(DIACRITICS, "");
  }

  return normalized
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}
