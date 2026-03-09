import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";

export const metadata = pageMetadata({
  title: "Webshop",
  description:
    "Smart TV- en streamingapparaten. Snel geleverd. Bestel eenvoudig met Stripe.",
  path: "/products",
});

export default async function ProductsPage() {
  let products: { id: string; name: string; slug: string; price: number; shortDescription: string | null }[] = [];
  try {
    products = await prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, slug: true, price: true, shortDescription: true },
    });
  } catch {
    // Table may not exist yet
  }

  return (
    <SiteShell>
      <div className="section-container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-marketing-text md:text-5xl">
            Webshop
          </h1>
          <p className="mt-6 text-lg text-marketing-textSecondary">
            Kwaliteitsapparaten voor streaming en smart TV. Eenvoudig bestellen, 1–3 werkdagen geleverd.
          </p>
        </div>
        <div className="mx-auto mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-gray-200 bg-surface p-12 text-center text-marketing-textSecondary">
              Er staan nog geen producten in de webshop. Beheer producten in het{" "}
              <Link href="/admin/products" className="text-blue-600 hover:underline">admin dashboard</Link>.
            </div>
          ) : (
            products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group rounded-2xl border border-gray-200 bg-surface p-6 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
              >
                <div className="aspect-square rounded-xl bg-slate-100 flex items-center justify-center">
                  <span className="text-sm text-marketing-textSecondary">Product</span>
                </div>
                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-marketing-text group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h2>
                  <p className="mt-2 text-marketing-textSecondary line-clamp-2">
                    {product.shortDescription ?? "Bekijk product voor details."}
                  </p>
                  <p className="mt-4 text-2xl font-semibold text-marketing-text">
                    €{product.price.toFixed(2)}{" "}
                    <span className="text-sm font-normal text-slate-500">excl. btw</span>
                  </p>
                  <span className="mt-4 inline-block text-sm font-medium text-blue-600">
                    Bekijk product →
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </SiteShell>
  );
}
