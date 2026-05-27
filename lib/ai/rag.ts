import { createClient } from "@/lib/supabase/server";
import { getDbRules } from "@/lib/rules/validator.server";

/** ملخص القواعد للسياق */
export async function getRulesContextSummary(): Promise<string> {
  const rules = await getDbRules();
  const allowed = Object.values(rules.allowed)
    .map((c) => `- ${c.name}: ${c.keywords.join("، ")}${c.conditions ? ` (${c.conditions})` : ""}`)
    .join("\n");

  try {
    const supabase = await createClient();
    const { data: dbRules } = await supabase
      .from("food_rules")
      .select("*");

    if (dbRules && dbRules.length > 0) {
      const allowedItems = dbRules
        .filter((r) => r.type === "allowed")
        .map((r) => `- ${r.name}${r.reason ? ` (السبب/الشرط: ${r.reason})` : ""}`)
        .join("\n");
      const prohibitedItems = dbRules
        .filter((r) => r.type === "prohibited")
        .map((r) => `- ${r.name} [الخطورة: ${r.severity}]${r.reason ? ` (السبب: ${r.reason})` : ""}`)
        .join("\n");

      return `قواعد نظام الطيبات المرجعية:\n\nالمسموحات:\n${allowedItems}\n\nالممنوعات:\n${prohibitedItems}`;
    }
  } catch (e) {
    console.error("Error generating rich rules summary from DB:", e);
  }

  const prohibited = Object.values(rules.prohibited)
    .map((c) => `- ${c.name} (${c.severity}): ${c.keywords.join("، ")}`)
    .join("\n");
  return `مسموح:\n${allowed}\n\nممنوع:\n${prohibited}`;
}

/** جلب مقاطع المعرفة من Supabase */
export async function fetchKnowledgeContext(query: string): Promise<string[]> {
  const supabase = await createClient();
  const { data: docs } = await supabase
    .from("knowledge_documents")
    .select("title, content")
    .eq("is_active", true)
    .limit(10);

  if (!docs?.length) return [];

  const q = query.toLowerCase();
  const scored = docs
    .map((d) => {
      const content = `${d.title} ${d.content}`.toLowerCase();
      const words = q.split(/\s+/).filter((w) => w.length > 2);
      const hits = words.filter((w) => content.includes(w)).length;
      return { doc: d, hits };
    })
    .filter((s) => s.hits > 0)
    .sort((a, b) => b.hits - a.hits);

  const top = scored.length > 0 ? scored : docs.map((d) => ({ doc: d, hits: 0 }));

  return top.slice(0, 5).map((s) => `## ${s.doc.title}\n${s.doc.content}`);
}
