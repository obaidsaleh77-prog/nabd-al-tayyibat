"use client";

import { useRef, useEffect, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ChatMessage } from "@/types/database";

interface ChatInterfaceProps {
  initialMessages: ChatMessage[];
  initialSessionId?: string;
}

export function ChatInterface({
  initialMessages,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (message: string) => {
    const res = await fetch("/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "فشل الاتصال");
    return data.reply;
  };

  const handleSend = async () => {
    if (!input.trim() || input.length > 2000 || loading) return;

    const userMsg = input.trim();
    setInput("");
    setError(null);

    const tempUser: ChatMessage = {
      id: `user-${Date.now()}`,
      session_id: "",
      user_id: "",
      role: "user",
      content: userMsg,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, tempUser]);

    setLoading(true);
    try {
      const reply = await sendMessage(userMsg);
      setMessages((m) => [
        ...m,
        {
          id: `ai-${Date.now()}`,
          session_id: "",
          user_id: "",
          role: "assistant",
          content: reply,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
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
          disabled={loading}
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

      {loading ? (
        <p className="text-sm text-primary/70 text-center">جارٍ التحميل...</p>
      ) : null}
      {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}

      <div className="flex gap-2 border-t border-slate-200 pt-3 dark:border-slate-700">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="اكتب سؤالك..."
          maxLength={2000}
          disabled={loading}
          aria-label="رسالة"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
        />
        <Button onClick={handleSend} isLoading={loading} aria-label="إرسال">
          <Send className="h-5 w-5" />
        </Button>
      </div>
      <p className="mt-1 text-xs text-slate-500">{input.length}/2000</p>
    </Card>
  );
}
