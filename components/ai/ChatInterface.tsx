"use client";

import { useRef, useEffect, useState, useTransition } from "react";
import { Send, Trash2 } from "lucide-react";
import { sendChatMessageAction, clearChatSessionAction } from "@/app/actions/chat";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ChatMessage } from "@/types/database";

interface ChatInterfaceProps {
  initialMessages: ChatMessage[];
  initialSessionId?: string;
}

export function ChatInterface({
  initialMessages,
  initialSessionId,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || input.length > 2000) return;

    const userMsg = input.trim();
    setInput("");
    setError(null);

    const tempUser: ChatMessage = {
      id: `temp-${Date.now()}`,
      session_id: sessionId ?? "",
      user_id: "",
      role: "user",
      content: userMsg,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, tempUser]);

    const fd = new FormData();
    fd.set("message", userMsg);
    if (sessionId) fd.set("sessionId", sessionId);

    startTransition(async () => {
      const result = await sendChatMessageAction({}, fd);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.sessionId) setSessionId(result.sessionId);
      if (result.reply) {
        const replyText = result.reply;
        setMessages((m) => [
          ...m,
          {
            id: `assistant-${Date.now()}`,
            session_id: result.sessionId ?? "",
            user_id: "",
            role: "assistant" as const,
            content: replyText,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    });
  };

  const handleClear = () => {
    if (!sessionId) {
      setMessages([]);
      return;
    }
    startTransition(async () => {
      await clearChatSessionAction(sessionId);
      setMessages([]);
      setSessionId(undefined);
    });
  };

  return (
    <Card className="flex h-[calc(100vh-12rem)] flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
        <h2 className="font-bold">اسألني — نظام الطيبات</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          aria-label="مسح المحادثة"
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div
        className="flex-1 space-y-3 overflow-y-auto py-4"
        role="log"
        aria-live="polite"
        aria-label="سجل المحادثة"
      >
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-500">
            اسأل عن المسموح والممنوع، الفترات، أو قواعد النظام
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "mr-8 rounded-lg bg-emerald-100 px-4 py-2 dark:bg-emerald-900/40"
                  : "ml-8 rounded-lg bg-slate-100 px-4 py-2 dark:bg-slate-800"
              }
            >
              <p className="whitespace-pre-wrap text-sm">{m.content}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}

      <div className="flex gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="اكتب سؤالك..."
          maxLength={2000}
          disabled={isPending}
          aria-label="رسالة"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
        />
        <Button onClick={handleSend} isLoading={isPending} aria-label="إرسال">
          <Send className="h-5 w-5" />
        </Button>
      </div>
      <p className="mt-1 text-xs text-slate-500">{input.length}/2000</p>
    </Card>
  );
}
