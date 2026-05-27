import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageCircle } from "lucide-react";
import { isFeatureEnabled } from "@/lib/features";
import { ChatInterface } from "@/components/ai/ChatInterface";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "اسألني" };

export default async function AiChatPage() {
  const enabled = await isFeatureEnabled("ai_chat");
  if (!enabled) {
    return (
      <div className="mx-auto max-w-2xl pt-8">
        <Card className="text-center py-10">
          <MessageCircle className="mx-auto h-10 w-10 text-muted mb-3" />
          <p className="text-muted">ميزة الشات معطّلة حالياً من قبل الإدارة.</p>
        </Card>
      </div>
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
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">اسألني</h1>
        <p className="text-sm text-muted">
          مساعد متخصص بنظام الطيبات فقط — لا تشخيص طبي ولا أدوية
        </p>
      </div>
      <ChatInterface initialMessages={messages} initialSessionId={sessionId} />
    </div>
  );
}
