"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface LastMessage {
  body: string;
  fromAdmin: boolean;
  createdAt: string;
}

interface ConversationSummary {
  id: string;
  visitorEmail: string;
  visitorName: string | null;
  status: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: LastMessage | null;
}

interface Message {
  id: string;
  body: string;
  fromAdmin: boolean;
  createdAt: string;
}

interface AdminChatClientProps {
  initialConversations: ConversationSummary[];
  currentUserId: string;
}

export function AdminChatClient({
  initialConversations,
  currentUserId,
}: AdminChatClientProps) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  const refreshPresence = useCallback(() => {
    fetch("/api/chat/presence", { method: "POST" }).catch(() => {});
  }, []);

  useEffect(() => {
    refreshPresence();
    const t = setInterval(refreshPresence, 60000);
    return () => clearInterval(t);
  }, [refreshPresence]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/chat/messages?conversationId=${encodeURIComponent(conversationId)}&markRead=true`
      );
      const data = await res.json();
      if (data?.messages) setMessages(data.messages);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId) fetchMessages(selectedId);
    else setMessages([]);
  }, [selectedId, fetchMessages]);

  const selected = conversations.find((c) => c.id === selectedId);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !replyText.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: selectedId, body: replyText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Versturen mislukt.");
      setReplyText("");
      await fetchMessages(selectedId);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedId ? { ...c, updatedAt: new Date().toISOString(), messageCount: c.messageCount + 1 } : c
        )
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <div className="rounded-2xl border border-white/10 bg-black/80 overflow-hidden">
        <div className="border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">Gesprekken</h2>
        </div>
        <ul className="max-h-[60vh] overflow-y-auto">
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 ${
                  selectedId === c.id ? "bg-amber-500/10 border-l-2 border-l-amber-500" : ""
                }`}
              >
                <p className="font-medium text-white truncate">{c.visitorName || c.visitorEmail}</p>
                <p className="text-xs text-zinc-500 truncate">{c.visitorEmail}</p>
                {c.lastMessage && (
                  <p className="text-xs text-zinc-400 mt-1 truncate">{c.lastMessage.body}</p>
                )}
              </button>
            </li>
          ))}
        </ul>
        {conversations.length === 0 && (
          <p className="p-4 text-sm text-zinc-500">Nog geen gesprekken.</p>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/80 overflow-hidden flex flex-col min-h-[500px]">
        {selected ? (
          <>
            <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  {selected.visitorName || selected.visitorEmail}
                </h2>
                <p className="text-xs text-zinc-500">{selected.visitorEmail}</p>
              </div>
              <Link
                href="/admin/chat"
                className="text-xs text-amber-400 hover:underline"
              >
                Vernieuwen
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px]">
              {loading ? (
                <p className="text-sm text-zinc-500">Laden…</p>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.fromAdmin ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                        m.fromAdmin
                          ? "bg-amber-500/20 text-amber-100 rounded-tr-md"
                          : "bg-white/10 text-white rounded-tl-md"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p className="mt-1 text-[10px] opacity-70">
                        {new Date(m.createdAt).toLocaleString("nl-NL")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleReply} className="border-t border-white/10 p-3">
              <div className="flex gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Typ uw antwoord..."
                  rows={2}
                  className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none resize-none"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="self-end rounded-lg bg-amber-500/30 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/40 disabled:opacity-50"
                >
                  {sending ? "…" : "Verstuur"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <p className="text-zinc-500">Selecteer een gesprek om te reageren.</p>
          </div>
        )}
      </div>
    </div>
  );
}
