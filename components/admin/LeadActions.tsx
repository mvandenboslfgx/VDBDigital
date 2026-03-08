"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LeadActionsProps {
  leadId: string;
  leadEmail: string;
  leadName: string;
}

export function LeadActions({ leadId, leadEmail, leadName }: LeadActionsProps) {
  const router = useRouter();
  const [showEmail, setShowEmail] = useState(false);
  const [subject, setSubject] = useState("Message from VDB Digital");
  const [body, setBody] = useState(`Hi ${leadName},\n\nWe received your request and will get back to you soon.\n\nBest regards,\nVDB Digital`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendEmail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/leads/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, subject, body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Send failed");
      setShowEmail(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete lead ${leadEmail}?`)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/delete?leadId=${encodeURIComponent(leadId)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Delete failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowEmail(true)}
        className="rounded border border-white/20 px-2 py-1 text-xs text-white hover:bg-white/10"
      >
        Send Email
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="rounded border border-red-500/50 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
      >
        Delete
      </button>
      {showEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/95 p-6">
            <h3 className="text-sm font-semibold text-white">Send email to {leadEmail}</h3>
            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="w-full rounded border border-white/20 bg-black/60 px-3 py-2 text-sm text-white"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                className="w-full rounded border border-white/20 bg-black/60 px-3 py-2 text-sm text-white"
              />
            </div>
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
            <div className="mt-4 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowEmail(false); setError(null); }}
                className="rounded border border-white/20 px-3 py-1.5 text-sm text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={loading}
                className="rounded bg-amber-500/20 px-3 py-1.5 text-sm text-amber-400"
              >
                {loading ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
