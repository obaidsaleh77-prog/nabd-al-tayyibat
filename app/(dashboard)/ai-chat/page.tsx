import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isFeatureEnabled } from "@/lib/features";
import { ChatInterface } from "@/components/ai/ChatInterface";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "اسألني" };

export default async function AiChatPage() {
  const enabled = await isFeatureEnabled("ai_chat");
  if (!enabled) {
    return (
      <Card>
        <p className="text-slate-500">ميزة الشات معطّلة حالياً من قبل الإدارة.</p>
      </Card>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sessions } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1);

  const sessionId = sessions?.[0]?.id;
  let messages: Array<{
    id: string;
    session_id: string;
    user_id: string;
    role: "user" | "assistant" | "system";
    content: string;
    created_at: string;
  }> = [];

  if (sessionId) {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    messages = (data ?? []) as typeof messages;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-bold">اسألني</h1>
      <p className="mb-4 text-sm text-slate-500">
        مساعد متخصص بنظام الطيبات فقط — لا تشخيص طبي ولا أدوية
      </p>
      <ChatInterface initialMessages={messages} initialSessionId={sessionId} />
    </div>
  );
}
