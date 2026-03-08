"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  invoiceId: string;
  status: string;
};

export default function InvoiceActions({ invoiceId, status }: Props) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [loading, setLoading] = useState(false);

  const markPaid = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });
      const data = (await res.json()) as { success?: boolean };
      if (data.success) {
        setCurrentStatus("paid");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {currentStatus !== "paid" && (
        <button
          type="button"
          onClick={markPaid}
          disabled={loading}
          className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-emerald-500/20"
        >
          {loading ? "…" : "Mark paid"}
        </button>
      )}
      <a
        href={`/admin/invoices/${invoiceId}/print`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-white/10"
      >
        Export PDF
      </a>
    </div>
  );
}
