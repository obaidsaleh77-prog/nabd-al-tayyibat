import { buildRagContext } from "./prompts";
import { getRulesContextSummary } from "./rag";

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

const MAX_HISTORY = 10;
const MAX_RESPONSE_LENGTH = 2000;

export async function generateTayyibatReply(
  userMessage: string,
  history: ChatHistoryItem[]
): Promise<string> {
  if (/دواء|تشخيص|مرض|علاج طبي|وصفة طبية/i.test(userMessage)) {
    return "يرجى استشارة مختص طبي معتمد.";
  }

  const rulesSummary = await getRulesContextSummary();
  const ragContext = buildRagContext(rulesSummary);

  const trimmedHistory = history.slice(-MAX_HISTORY);
  const historyText = trimmedHistory
    .map((h) => `${h.role === "user" ? "المستخدم" : "المساعد"}: ${h.content}`)
    .join("\n");

  const fullMessage = `
قواعد النظام:
${ragContext}

المحادثة السابقة:
${historyText}

سؤال المستخدم: ${userMessage}`.trim();

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/ai-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: fullMessage }),
    });

    const data = await res.json();

    if (res.ok && data.reply) {
      return data.reply.slice(0, MAX_RESPONSE_LENGTH);
    }

    console.error("AI Chat API error:", data.error);
    return "عذراً، حدث خطأ في الاتصال. حاول مرة أخرى.";
  } catch (error) {
    console.error("AI Chat fetch error:", error);
    return "عذراً، تعذر الاتصال بخدمة الذكاء الاصطناعي.";
  }
}
