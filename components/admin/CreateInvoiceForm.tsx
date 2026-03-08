"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Client = { id: string; name: string; email: string };

export default function CreateInvoiceForm({
  clients,
  onCreated,
}: {
  clients: Client[];
  onCreated?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const amountEur = parseFloat(amount);
      if (!clientId || !Number.isFinite(amountEur) || amountEur <= 0) {
        setError("Client and a positive amount are required.");
        return;
      }
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          amount: amountEur,
          dueDate: dueDate || undefined,
          description: description || undefined,
        }),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (data.success) {
        setOpen(false);
        setClientId("");
        setAmount("");
        setDueDate("");
        setDescription("");
        onCreated?.();
        router.refresh();
      } else {
        setError(data.message ?? "Failed to create invoice.");
      }
    } catch {
      setError("Request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary"
      >
        Create invoice
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/95 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white">Create invoice</h3>
            <form onSubmit={submit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-400">Client</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="input-base mt-1"
                  required
                >
                  <option value="">Select client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400">Amount (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-base mt-1"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400">Due date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input-base mt-1"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-base mt-1"
                  placeholder="Optional"
                />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
