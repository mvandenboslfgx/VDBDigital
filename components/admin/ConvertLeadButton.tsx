"use client";

import { useState } from "react";

type Props = {
  leadId: string;
  leadName: string;
  leadEmail: string;
  leadCompany: string | null;
};

export function ConvertLeadButton({ leadId, leadName, leadEmail, leadCompany }: Props) {
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const name = (projectName || "").trim();
    if (!name) {
      setMessage({ type: "err", text: "Project name is required." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/convert-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          email: leadEmail,
          projectName: name,
          projectStatus: "draft",
          sendInviteEmail: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.message || "Conversion failed." });
        return;
      }
      setMessage({ type: "ok", text: "Lead converted. Refreshing…" });
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      setMessage({ type: "err", text: "Request failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary text-xs px-3 py-1.5"
      >
        Convert → Client
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/95 p-6 shadow-xl">
            <h3 className="text-sm font-semibold text-white">Convert lead to client</h3>
            <p className="mt-1 text-xs text-gray-400">{leadName} · {leadEmail}</p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Project name *</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Company Website Redesign"
                  className="input-base"
                  autoFocus
                />
              </div>
              {message && (
                <p className={message.type === "ok" ? "success-text" : "error-text"}>
                  {message.text}
                </p>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setMessage(null); }}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Converting…" : "Convert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
