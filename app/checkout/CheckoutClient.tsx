"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CartItem = { slug: string; name: string; price: number; qty: number };

export function CheckoutClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem("vdb-cart") : null;
    setItems(raw ? JSON.parse(raw) : []);
    setMounted(true);
  }, []);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const startCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            // Cart stores product slug; API can resolve by id OR slug.
            productId: i.slug,
            quantity: i.qty,
          })),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = (data as any)?.error || (data as any)?.message;
        const suffix = message ? `: ${message}` : "";
        throw new Error(`HTTP ${res.status}${suffix}`);
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error((data as any)?.error || (data as any)?.message || "Checkout URL ontbreekt.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Checkout faalde. Probeer opnieuw.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="mt-10 rounded-2xl border border-slate-200 bg-surface p-12 text-center text-marketing-textSecondary">
        Laden…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-slate-200 bg-surface p-12 text-center">
        <p className="text-lg text-marketing-textSecondary">Geen producten om af te rekenen.</p>
        <Link
          href="/apparaten"
          className="mt-6 inline-block rounded-xl bg-gold px-6 py-3 font-semibold text-black hover:bg-goldHover"
        >
          Naar apparaten
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 max-w-xl rounded-2xl border border-slate-200 bg-surface p-8 shadow-sm">
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.slug} className="flex justify-between text-marketing-text">
            <span>{item.name} × {item.qty}</span>
            <span>€{(item.price * item.qty).toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xl font-semibold text-marketing-text">
        Totaal: €{total.toFixed(2)}
      </p>
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={startCheckout}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Bezig met Stripe..." : "Naar Stripe betaling"}
        </button>
        <Link
          href="/apparaten"
          className="inline-flex items-center justify-center rounded-xl bg-gold px-6 py-3 font-semibold text-black hover:bg-goldHover"
        >
          Verder winkelen
        </Link>
      </div>
    </div>
  );
}
