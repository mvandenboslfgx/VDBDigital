"use client";

import { useState } from "react";
import Link from "next/link";

const CART_KEY = "vdb-cart";
const SLUG = "android-14-tv-box";
const NAME = "Android 14 Smart TV Box 8K";
const PRICE = 89;

export function ProductOrderButton() {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (typeof window === "undefined") return;
    const cart = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]");
    const existing = cart.find((i: { slug: string }) => i.slug === SLUG);
    if (existing) existing.qty += 1;
    else cart.push({ slug: SLUG, name: NAME, price: PRICE, qty: 1 });
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="flex flex-wrap gap-4">
      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-white font-medium shadow-sm transition-colors hover:bg-indigo-700"
      >
        {added ? "Toegevoegd aan winkelwagen ✓" : "Bestel nu"}
      </button>
      {added && (
        <Link
          href="/cart"
          className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-6 py-3 text-indigo-700 font-medium transition-colors hover:bg-indigo-100"
        >
          Naar winkelwagen
        </Link>
      )}
    </div>
  );
}
