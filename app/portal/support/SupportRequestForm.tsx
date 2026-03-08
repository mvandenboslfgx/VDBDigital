"use client";

import { useState } from "react";

export default function SupportRequestForm() {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("revision");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/portal/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message }),
      });
      const data = await res.json();
      if (data.success) setSent(true);
      else alert(data.message ?? "Failed to send.");
    } catch {
      alert("Failed to send request.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return <p className="mt-4 text-emerald-400">Request sent. We’ll be in touch.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-lg">
      <div>
        <label className="block text-xs font-medium text-gray-300">Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)} className="input-base mt-1">
          <option value="revision">Revision</option>
          <option value="requirement">New requirement</option>
          <option value="support">General support</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-300">Message</label>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="input-base mt-1 min-h-[120px]" required />
      </div>
      <button type="submit" disabled={loading} className="btn-primary">Send request</button>
    </form>
  );
}
