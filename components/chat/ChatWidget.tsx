"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { ChatWindow } from "./ChatWindow";
import { OfflineForm } from "./OfflineForm";

const ChatWindowLazy = dynamic(() => Promise.resolve(ChatWindow), { ssr: false });

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorName, setVisitorName] = useState("");

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/status");
      const data = await res.json();
      if (data?.adminOnline !== undefined) setAdminOnline(data.adminOnline);
    } catch {
      setAdminOnline(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const t = setInterval(fetchStatus, 30000);
    return () => clearInterval(t);
  }, [fetchStatus]);

  useEffect(() => {
    const handler = (e: CustomEvent<string>) => setConversationId(e.detail);
    window.addEventListener("chat:conversation", handler as EventListener);
    return () => window.removeEventListener("chat:conversation", handler as EventListener);
  }, []);

  async function handleOfflineSubmit(data: { email: string; name: string; message: string }) {
    const res = await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        name: data.name,
        message: data.message,
      }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result?.message || "Versturen mislukt.");
    setVisitorEmail(data.email);
    setVisitorName(data.name);
    if (result.conversationId) setConversationId(result.conversationId);
  }

  const showOfflineForm = open && !conversationId && !adminOnline;
  const showChat = open && (conversationId || adminOnline);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#111] shadow-lg transition-all hover:scale-105 hover:border-amber-500/30 hover:shadow-amber-500/10"
        aria-label={open ? "Chat sluiten" : "Chat openen"}
      >
        {open ? (
          <svg className="h-6 w-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f10] shadow-2xl">
          {showOfflineForm && (
            <div className="max-h-[70vh] overflow-y-auto">
              <div className="border-b border-white/10 px-4 py-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Laat een bericht achter</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
                  aria-label="Sluiten"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <OfflineForm
                defaultEmail={visitorEmail}
                defaultName={visitorName}
                onSubmit={handleOfflineSubmit}
                onSuccess={() => setOpen(false)}
              />
            </div>
          )}

          {showChat && (
            <div className="h-[420px]">
              <ChatWindowLazy
                conversationId={conversationId}
                visitorEmail={visitorEmail || ""}
                visitorName={visitorName}
                adminOnline={adminOnline}
                onClose={() => setOpen(false)}
                onConversationStart={(id, e, n) => {
                  setConversationId(id);
                  setVisitorEmail(e);
                  setVisitorName(n);
                }}
              />
            </div>
          )}

          {open && !showOfflineForm && !showChat && (
            <div className="p-6">
              <p className="text-sm text-zinc-400 mb-4">
                Vul uw e-mail en bericht in om te starten. We antwoorden zo snel mogelijk.
              </p>
              <OfflineForm
                defaultEmail={visitorEmail}
                defaultName={visitorName}
                onSubmit={handleOfflineSubmit}
                onSuccess={(id) => id && setConversationId(id)}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
