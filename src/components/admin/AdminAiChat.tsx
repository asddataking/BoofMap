"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { Bot, Minimize2, Send, Sparkles } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

export function AdminAiChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey — I'm your BoofMap admin assistant. Ask me about users, reports, moderation, or what to do next.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const stats = useQuery(api.admin.getDashboardStats);
  const queue = useQuery(api.admin.listModerationQueue);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError(null);
    const userMsg: Message = { role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const context = stats
        ? {
            total_users: stats.total_users,
            new_users_this_week: stats.new_users_this_week,
            total_reports: stats.total_reports,
            pending_reports: stats.pending_reports,
            pending_meetups: stats.pending_meetups,
            pending_queue: stats.pending_queue,
            recent_signups: stats.recent_signups.slice(0, 5),
            queue_preview: (queue ?? []).slice(0, 3).map((q) => ({
              type: q.source_type,
              reasons: q.reasons,
              preview: q.preview_text?.slice(0, 120),
            })),
          }
        : undefined;

      const res = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(({ role, content }) => ({
            role,
            content,
          })),
          context,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error ?? "Request failed");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value, { stream: true });
          const snapshot = assistantText;
          setMessages((m) => {
            const next = [...m];
            next[next.length - 1] = { role: "assistant", content: snapshot };
            return next;
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_8px_32px_rgba(16,185,129,0.4)] transition hover:scale-105 active:scale-95 lg:bottom-8 lg:right-8"
          aria-label="Open AI assistant"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-4 right-4 z-50 flex h-[min(520px,calc(100dvh-2rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.6)] lg:bottom-8 lg:right-8">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                <Sparkles className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Admin AI</p>
                <p className="text-[10px] text-zinc-500">Powered by GPT-4o mini</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                aria-label="Minimize"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "ml-auto bg-emerald-600/20 text-emerald-100"
                    : "bg-zinc-900 text-zinc-300"
                )}
              >
                {msg.content || (loading && i === messages.length - 1 ? "…" : "")}
              </div>
            ))}
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {error}
              </div>
            )}
          </div>

          <div className="border-t border-zinc-800 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about users, reports, moderation…"
                className="form-input flex-1 !py-2.5 text-sm"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-500 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
