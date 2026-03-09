"use client";

import { useState } from "react";
import Link from "next/link";

export function AddToCartButton({
  slug,
  name,
  price,
}: {
  slug: string;
  name: string;
  price: number | null;
}) {
  const [added, setAdded] = useState(false);

  if (price === null) {
    return (
      <Link
        href="/apparaten"
        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-surface px-8 py-4 text-lg font-semibold text-marketing-text transition-colors hover:bg-slate-50"
      >
        Bekijk accessoires
      </Link>
    );
  }

  const handleAdd = () => {
    if (typeof window === "undefined") return;
    const cart = JSON.parse(window.localStorage.getItem("vdb-cart") || "[]");
    const existing = cart.find((i: { slug: string }) => i.slug === slug);
    if (existing) existing.qty += 1;
    else cart.push({ slug, name, price, qty: 1 });
    window.localStorage.setItem("vdb-cart", JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-surface px-8 py-4 text-lg font-semibold text-marketing-text transition-colors hover:bg-slate-50"
      >
        {added ? "Toegevoegd ✓" : "In winkelwagen"}
      </button>
      {added && (
        <Link
          href="/cart"
          className="inline-flex items-center justify-center rounded-xl border border-gold/40 bg-gold/10 px-8 py-4 text-lg font-semibold text-gold transition-colors hover:bg-gold/20"
        >
          Naar winkelwagen
        </Link>
      )}
    </>
  );
}
