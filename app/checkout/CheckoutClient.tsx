"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CartItem = { slug: string; name: string; price: number; qty: number };

export function CheckoutClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem("vdb-cart") : null;
    setItems(raw ? JSON.parse(raw) : []);
    setMounted(true);
  }, []);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  if (!mounted) {
    return (
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center text-marketing-textSecondary">
        Laden…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center">
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
    <div className="mt-10 max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
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
      <p className="mt-6 text-sm text-marketing-textSecondary">
        Betaling wordt afgehandeld via Stripe. Voor een volledige integratie zijn Stripe Checkout-sessie en webhook nodig; deze pagina toont de bestellingsoverzicht. Neem contact op voor zakelijke bestellingen.
      </p>
      <Link
        href="/apparaten"
        className="mt-6 inline-block rounded-xl bg-gold px-6 py-3 font-semibold text-black hover:bg-goldHover"
      >
        Verder winkelen
      </Link>
    </div>
  );
}
