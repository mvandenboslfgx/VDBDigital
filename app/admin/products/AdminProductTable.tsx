"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  category: string;
};

export function AdminProductTable({ products }: { products: Product[] }) {
  const router = useRouter();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Product "${name}" verwijderen?`)) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Verwijderen mislukt");
    }
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-gray-400">
        Nog geen producten. <Link href="/admin/products/new" className="text-blue-400 hover:underline">Eerste product toevoegen</Link>
      </div>
    );
  }

  return (
    <table className="w-full min-w-[600px] text-left text-sm">
      <thead>
        <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
          <th className="pb-3 pr-4 font-medium">Product</th>
          <th className="pb-3 pr-4 font-medium">Prijs</th>
          <th className="pb-3 pr-4 font-medium">Voorraad</th>
          <th className="pb-3 pr-4 font-medium">Bewerken</th>
          <th className="pb-3 font-medium">Verwijderen</th>
        </tr>
      </thead>
      <tbody className="text-gray-300">
        {products.map((p) => (
          <tr key={p.id} className="border-b border-white/5">
            <td className="py-3 pr-4 font-medium text-white">
              {p.name}
              {p.category && (
                <span className="ml-2 text-xs text-gray-500">({p.category})</span>
              )}
            </td>
            <td className="py-3 pr-4">€{p.price.toFixed(2)}</td>
            <td className="py-3 pr-4">{p.stock}</td>
            <td className="py-3 pr-4">
              <Link
                href={`/admin/products/${p.id}`}
                className="text-blue-400 hover:underline"
              >
                Bewerken
              </Link>
            </td>
            <td className="py-3">
              <button
                type="button"
                onClick={() => handleDelete(p.id, p.name)}
                className="text-red-400 hover:underline"
              >
                Verwijderen
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
