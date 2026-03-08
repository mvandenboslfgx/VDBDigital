"use client";

import { useState } from "react";

interface OfflineFormProps {
  defaultEmail?: string;
  defaultName?: string;
  onSubmit: (data: { email: string; name: string; message: string }) => Promise<void>;
  onSuccess?: (conversationId: string) => void;
}

export function OfflineForm({
  defaultEmail = "",
  defaultName = "",
  onSubmit,
  onSuccess,
}: OfflineFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [name, setName] = useState(defaultName);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !message.trim()) {
      setError("Vul e-mail en bericht in.");
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ email: email.trim(), name: name.trim() || "Bezoeker", message: message.trim() });
      setMessage("");
      if (onSuccess) {
        // Caller will switch to chat view with new conversation
        onSuccess("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Versturen mislukt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
      <p className="text-sm text-zinc-400">
        Er is nu geen medewerker beschikbaar. Laat uw gegevens achter, dan nemen we contact op.
      </p>
      <div>
        <label htmlFor="chat-email" className="block text-xs font-medium text-zinc-500 mb-1">
          E-mail *
        </label>
        <input
          id="chat-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="uw@email.nl"
          required
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="chat-name" className="block text-xs font-medium text-zinc-500 mb-1">
          Naam
        </label>
        <input
          id="chat-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Uw naam"
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="chat-message" className="block text-xs font-medium text-zinc-500 mb-1">
          Bericht *
        </label>
        <textarea
          id="chat-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Typ uw bericht..."
          rows={4}
          required
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none resize-none"
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-amber-500/20 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/30 disabled:opacity-50"
      >
        {loading ? "Versturen…" : "Bericht versturen"}
      </button>
    </form>
  );
}
