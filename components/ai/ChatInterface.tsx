"use client";

import { useRef, useEffect, useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  id?: string;
}

interface ChatInterfaceProps {
  initialMessages?: ChatMessage[];
}

export function ChatInterface({
  initialMessages,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || input.length > 2000 || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    setLoading(true);
    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!response) {
        throw new Error("لم يتم استلام رد من الخادم");
      }

      const data = await response.json();

      if (!data) {
        throw new Error("البيانات المستلمة فارغة");
      }

      if (response.ok && data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        const errorMessage = data?.error || "حدث خطأ غير متوقع";
        setMessages((prev) => [...prev, { role: "system", content: `عذراً، ${errorMessage}` }]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { role: "system", content: "عذراً، حدث خطأ في الاتصال. حاول مرة أخرى." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
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
          messages.map((m, i) => (
            <div
              key={m.id ?? i}
              className={`rounded-lg px-4 py-2 ${
                m.role === "user"
                  ? "mr-8 bg-emerald-100 dark:bg-emerald-900/40"
                  : m.role === "system"
                  ? "bg-red-50 text-red-600 dark:bg-red-950/30"
                  : "ml-8 bg-slate-100 dark:bg-slate-800"
              }`}
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
