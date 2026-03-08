"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CartItem = { slug: string; name: string; price: number; qty: number };

export function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem("vdb-cart") : null;
    setItems(raw ? JSON.parse(raw) : []);
    setMounted(true);
  }, []);

  const remove = (slug: string) => {
    const next = items.filter((i) => i.slug !== slug);
    setItems(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("vdb-cart", JSON.stringify(next));
    }
  };

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  if (!mounted) {
    return (
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center text-marketing-textSecondary">
        Winkelwagen laden…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-lg text-marketing-textSecondary">Je winkelwagen is leeg.</p>
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
    <div className="mt-10 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <ul className="divide-y divide-slate-200">
          {items.map((item) => (
            <li key={item.slug} className="flex items-center justify-between gap-4 p-6">
              <div>
                <p className="font-semibold text-marketing-text">{item.name}</p>
                <p className="text-sm text-marketing-textSecondary">
                  €{item.price} × {item.qty}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-lg font-semibold text-marketing-text">
                  €{(item.price * item.qty).toFixed(2)}
                </p>
                <button
                  type="button"
                  onClick={() => remove(item.slug)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Verwijderen
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="border-t border-slate-200 p-6 flex justify-between items-center">
          <p className="text-xl font-semibold text-marketing-text">Totaal: €{total.toFixed(2)}</p>
          <Link
            href="/checkout"
            className="rounded-xl bg-gold px-8 py-4 font-semibold text-black hover:bg-goldHover"
          >
            Afrekenen
          </Link>
        </div>
      </div>
    </div>
  );
}
