"use client";

import { useState } from "react";

export function ProductBuyButton({
  productId,
  disabled,
}: {
  productId: string;
  productName: string;
  price: number;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/product-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      alert(data.error || "Checkout kon niet worden gestart.");
    } finally {
      setLoading(false);
    }
  };

  if (disabled) {
    return (
      <p className="text-slate-500">Momenteel niet op voorraad.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Bezig…" : "Bestel nu"}
      </button>
    </div>
  );
}
