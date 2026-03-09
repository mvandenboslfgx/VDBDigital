import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { AdminProductTable } from "./AdminProductTable";

export default async function AdminProductsPage() {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user)) redirect("/dashboard");

  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-6 shadow-sm backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Producten</h1>
          <p className="mt-1 text-sm text-gray-400">
            Beheer webshopproducten. Prijs, voorraad en afbeeldingen aanpasbaar zonder code.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          + Nieuw product
        </Link>
      </div>
      <div className="mt-6 overflow-x-auto">
        <AdminProductTable products={products} />
      </div>
      <p className="mt-4 text-xs text-gray-500">
        <Link href="/products" className="underline hover:text-gray-400">Bekijk webshop →</Link>
      </p>
    </div>
  );
}
