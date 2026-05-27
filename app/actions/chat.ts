"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateTayyibatReply } from "@/lib/ai/chat";
import { isFeatureEnabled } from "@/lib/features";

const messageSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().uuid().optional(),
});

export interface ChatActionState {
  error?: string;
  reply?: string;
  sessionId?: string;
}

export async function sendChatMessageAction(
  _prev: ChatActionState,
  formData: FormData
): Promise<ChatActionState> {
  const enabled = await isFeatureEnabled("ai_chat");
  if (!enabled) return { error: "ميزة الشات معطّلة حالياً" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "يجب تسجيل الدخول" };

  const parsed = messageSchema.safeParse({
    message: formData.get("message"),
    sessionId: formData.get("sessionId") || undefined,
  });

  if (!parsed.success) {
    return { error: "الرسالة غير صالحة" };
  }

  let sessionId = parsed.data.sessionId;

  if (!sessionId) {
    const { data: session, error } = await supabase
      .from("chat_sessions")
      .insert({ user_id: user.id, title: parsed.data.message.slice(0, 50) })
      .select("id")
      .single();

    if (error || !session) return { error: "تعذر إنشاء المحادثة" };
    sessionId = session.id;
  }

  await supabase.from("chat_messages").insert({
    session_id: sessionId,
    user_id: user.id,
    role: "user",
    content: parsed.data.message,
  });

  const { data: historyRows } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(20);

  const history = (historyRows ?? [])
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(0, -1)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  const reply = await generateTayyibatReply(parsed.data.message, history);

  await supabase.from("chat_messages").insert({
    session_id: sessionId,
    user_id: user.id,
    role: "assistant",
    content: reply,
  });

  revalidatePath("/ai-chat");

  return { reply, sessionId };
}

export async function clearChatSessionAction(sessionId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  await supabase
    .from("chat_messages")
    .delete()
    .eq("session_id", sessionId)
    .eq("user_id", user.id);

  await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id);

  revalidatePath("/ai-chat");
  return {};
}

export async function getChatMessages(sessionId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  return data ?? [];
}
