"use client";

import { useState } from "react";

export default function PortalNewsletterSetting({
  initialOptIn,
  email,
}: {
  initialOptIn: boolean;
  email: string;
}) {
  const [optIn, setOptIn] = useState(initialOptIn);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const save = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/portal/settings/newsletter", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsletterOptIn: optIn }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (data.success) {
        setMessage("Preferences saved.");
      } else {
        setMessage(data.message ?? "Failed to save.");
      }
    } catch {
      setMessage("Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/60 p-4">
      <h3 className="text-sm font-semibold text-white">Newsletter</h3>
      <p className="mt-1 text-xs text-gray-400">
        Receive updates and marketing tips from VDB Digital.
      </p>
      <label className="mt-4 flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={optIn}
          onChange={(e) => setOptIn(e.target.checked)}
          className="h-4 w-4 rounded border-gray-600 bg-black/60 text-gold focus:ring-gold"
        />
        <span className="text-sm text-gray-300">I want to receive newsletter emails</span>
      </label>
      {message && (
        <p className={`mt-3 text-sm ${message === "Preferences saved." ? "text-emerald-400" : "text-red-400"}`}>
          {message}
        </p>
      )}
      <button
        type="button"
        onClick={save}
        disabled={loading}
        className="btn-primary mt-4"
      >
        {loading ? "Saving…" : "Save preferences"}
      </button>
    </div>
  );
}
