import Groq from "groq-sdk";
import { RunnableLambda } from "@langchain/core/runnables";
import { TAYYIBAT_SYSTEM_PROMPT, buildRagContext } from "./prompts";
import { getRulesContextSummary, fetchKnowledgeContext } from "./rag";

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

const MAX_HISTORY = 10;
const MAX_RESPONSE_LENGTH = 2000;

interface ChatPipelineInput {
  userMessage: string;
  history: ChatHistoryItem[];
  ragContext: string;
}

/** مسار LangChain (RunnableLambda) → استدعاء Groq API */
const chatPipeline = new RunnableLambda({
  func: async (input: ChatPipelineInput): Promise<string> => {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        return "خدمة الذكاء الاصطناعي غير مفعّلة. يرجى إضافة GROQ_API_KEY.";
      }

      const groq = new Groq({ apiKey });
      const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

      const messages: Groq.Chat.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: `${TAYYIBAT_SYSTEM_PROMPT}\n\n${input.ragContext}`,
        },
        ...input.history.map((h) => ({
          role: h.role as "user" | "assistant",
          content: h.content,
        })),
        { role: "user", content: input.userMessage.slice(0, 2000) },
      ];

      const completion = await groq.chat.completions.create({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 1024,
      });

    const text = completion.choices[0]?.message?.content ?? "";
    return text;
  },
});

export async function generateTayyibatReply(
  userMessage: string,
  history: ChatHistoryItem[]
): Promise<string> {
  if (/دواء|تشخيص|مرض|علاج طبي|وصفة طبية/i.test(userMessage)) {
    return "يرجى استشارة مختص طبي معتمد.";
  }

  const rulesSummary = await getRulesContextSummary();
  const docs = await fetchKnowledgeContext(userMessage);
  const ragContext = buildRagContext(rulesSummary, docs);

  const trimmedHistory = history.slice(-MAX_HISTORY);

  const reply = await chatPipeline.invoke({
    userMessage,
    history: trimmedHistory,
    ragContext,
  });

  return reply.slice(0, MAX_RESPONSE_LENGTH);
}
