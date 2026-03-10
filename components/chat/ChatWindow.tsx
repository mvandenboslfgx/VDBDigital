"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  body: string;
  fromAdmin: boolean;
  createdAt: string;
}

interface ChatWindowProps {
  conversationId: string | null;
  visitorEmail: string;
  visitorName?: string;
  adminOnline: boolean;
  onClose: () => void;
  onConversationStart?: (id: string, email: string, name: string) => void;
}

export function ChatWindow({
  conversationId,
  visitorEmail: initialEmail,
  visitorName: initialName,
  adminOnline,
  onClose,
  onConversationStart,
}: ChatWindowProps) {
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState(initialName || "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const visitorEmail = conversationId ? initialEmail : email;
  const visitorName = conversationId ? initialName : name;

  const fetchMessages = async () => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        conversationId,
        visitorEmail: visitorEmail || "",
      });
      const res = await fetch(`/api/chat/messages?${params.toString()}`);
      const data = await res.json();
      if (data?.messages) setMessages(data.messages);
    } catch {
      setError("Berichten laden mislukt.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (conversationId) fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const pollInterval = conversationId && adminOnline ? 8000 : 0;
  useEffect(() => {
    if (!pollInterval) return;
    const t = setInterval(fetchMessages, pollInterval);
    return () => clearInterval(t);
  }, [pollInterval, conversationId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: visitorEmail,
          name: visitorName,
          message: text,
          conversationId: conversationId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Versturen mislukt.");
      setInput("");
      if (data.conversationId && !conversationId) {
        onConversationStart?.(data.conversationId, visitorEmail, visitorName ?? "");
        window.dispatchEvent(new CustomEvent("chat:conversation", { detail: data.conversationId }));
      }
      await fetchMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Versturen mislukt.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#0f0f10]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Chat</h3>
          <p className="text-xs text-zinc-500">
            {adminOnline ? "Live chat · We antwoorden zo snel mogelijk." : "U ontvangt een reactie per e-mail."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
          aria-label="Sluiten"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
        {loading ? (
          <p className="text-sm text-zinc-500">Berichten laden…</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.fromAdmin ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  m.fromAdmin
                    ? "bg-white/10 text-white rounded-tl-md"
                    : "bg-amber-500/20 text-amber-100 rounded-tr-md"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p className="mt-1 text-[10px] opacity-70">
                  {new Date(m.createdAt).toLocaleTimeString("nl-NL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-4 text-xs text-red-400">{error}</p>}

      {!conversationId && (
        <div className="border-t border-white/10 px-3 py-2 space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Uw e-mail *"
            required
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Uw naam (optioneel)"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none"
          />
        </div>
      )}

      <form onSubmit={handleSend} className="border-t border-white/10 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Typ uw bericht..."
            className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !input.trim() || (!conversationId && !email.trim())}
            className="rounded-lg bg-amber-500/30 px-4 py-2 text-sm font-medium text-amber-300 hover:bg-amber-500/40 disabled:opacity-50"
          >
            {sending ? "…" : "Verstuur"}
          </button>
        </div>
      </form>
    </div>
  );
}
