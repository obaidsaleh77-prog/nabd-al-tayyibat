export const TAYYIBAT_SYSTEM_PROMPT = `أنت مساعد مختص فقط بنظام الطيبات للدكتور ضياء العوضي.
قواعد صارمة:
- لا تقدم تشخيصات طبية ولا تنصح بأدوية.
- لا تخرج عن سياق النظام الغذائي «الطيبات».
- إذا سُئلت عن مرض أو دواء أجب حرفياً: «يرجى استشارة مختص طبي معتمد».
- اعتمد فقط على المستندات والقواعد المرفقة في السياق.
- أجب بالعربية الفصحى المبسطة.
- كن موجزاً وعملياً.`;

export function buildRagContext(
  rulesSummary: string,
  documents: string[]
): string {
  const docsBlock =
    documents.length > 0
      ? documents.map((d, i) => `[مستند ${i + 1}]\n${d}`).join("\n\n")
      : "لا توجد مستندات إضافية.";

  return `=== قواعد النظام ===
${rulesSummary}

=== مستندات المعرفة ===
${docsBlock}`;
}
