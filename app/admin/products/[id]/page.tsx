import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "../ProductForm";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user || !canAccessAdmin(user)) redirect("/dashboard");

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const images: string[] = Array.isArray(product.images)
    ? (product.images as string[])
    : [];
  const specifications =
    product.specifications && typeof product.specifications === "object"
      ? (product.specifications as Record<string, string>)
      : {};

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-6 shadow-sm backdrop-blur-xl">
      <Link href="/admin/products" className="text-sm text-gray-400 hover:text-white">
        ← Producten
      </Link>
      <h1 className="mt-4 text-xl font-semibold text-white">Product bewerken</h1>
      <p className="mt-1 text-sm text-gray-400">
        {product.name} ({product.slug})
      </p>
      <ProductForm
        className="mt-8"
        productId={product.id}
        initialData={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription,
          price: product.price,
          images,
          stock: product.stock,
          category: product.category,
          specifications,
          metaTitle: product.metaTitle,
          metaDescription: product.metaDescription,
        }}
      />
    </div>
  );
}
