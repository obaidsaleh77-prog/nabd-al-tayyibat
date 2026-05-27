import { normalizeArabic } from "./normalize";

/** مسافة Levenshtein */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array<number>(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost
      );
    }
  }

  return dp[m]![n]!;
}

/** نسبة التشابه 0–1 */
export function similarityRatio(a: string, b: string): number {
  if (!a.length && !b.length) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

/** هل النص يحتوي على الكلمة أو يطابقها ضبابياً */
export function fuzzyContains(
  haystack: string,
  needle: string,
  threshold: number,
  normalize = true
): { match: boolean; confidence: number } {
  const h = normalize ? normalizeArabic(haystack) : haystack;
  const n = normalize ? normalizeArabic(needle) : needle;

  if (h.includes(n)) return { match: true, confidence: 1 };

  const words = h.split(/\s+/).filter(Boolean);
  let best = 0;

  for (const word of words) {
    const ratio = similarityRatio(word, n);
    if (ratio > best) best = ratio;
    if (h.length >= n.length) {
      for (let i = 0; i <= h.length - n.length; i++) {
        const slice = h.slice(i, i + n.length);
        const sliceRatio = similarityRatio(slice, n);
        if (sliceRatio > best) best = sliceRatio;
      }
    }
  }

  const fullRatio = similarityRatio(h, n);
  best = Math.max(best, fullRatio);

  return { match: best >= threshold, confidence: best };
}

/** استخراج كلمات من نص OCR أو قائمة مكونات */
export function tokenizeIngredients(text: string): string[] {
  return text
    .split(/[,،;\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}
