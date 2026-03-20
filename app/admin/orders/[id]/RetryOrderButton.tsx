"use client";

import { useState } from "react";

export function RetryOrderButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  async function onRetry() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/orders/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(typeof body?.error === "string" ? body.error : "Retry mislukt.");
        return;
      }
      setMessage("Retry job ingepland.");
    } catch {
      setMessage("Netwerkfout tijdens retry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onRetry}
        disabled={loading}
        className="rounded-lg border border-indigo-400/50 bg-indigo-500/20 px-4 py-2 text-sm font-medium text-indigo-100 transition hover:bg-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Retry bezig..." : "Retry verwerking"}
      </button>
      {message && <p className="text-xs text-gray-300">{message}</p>}
    </div>
  );
}
