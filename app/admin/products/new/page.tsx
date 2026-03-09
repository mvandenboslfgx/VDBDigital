import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/permissions";
import { ProductForm } from "../ProductForm";

export default async function AdminProductsNewPage() {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user)) redirect("/dashboard");

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-6 shadow-sm backdrop-blur-xl">
      <Link href="/admin/products" className="text-sm text-gray-400 hover:text-white">
        ← Producten
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-white">Nieuw product</h1>
      <p className="mt-1 text-sm text-gray-400">
        Vul de velden in. Slug wordt gebruikt in de URL (bijv. android-tv-box).
      </p>
      <ProductForm className="mt-8" />
    </div>
  );
}
