import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/metadata";
import { ProductBuyButton } from "./ProductBuyButton";
import { stockPhotos } from "@/lib/stock-photos";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Product" };
  const title = product.metaTitle ?? `${product.name} | Webshop`;
  const description =
    product.metaDescription ?? product.shortDescription ?? product.description.slice(0, 160);
  const path = `/products/${product.slug}`;
  return {
    title: `${title} | VDB Digital`,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${path}`,
      siteName: "VDB Digital",
      type: "website",
      locale: "nl_NL",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) notFound();

  const images = Array.isArray(product.images) ? (product.images as string[]) : [];
  const specifications =
    product.specifications && typeof product.specifications === "object"
      ? (product.specifications as Record<string, string>)
      : {};
  const specEntries = Object.entries(specifications);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description,
    url: `${siteUrl}/products/${product.slug}`,
    image: images.length > 0 ? images.map((p) => (p.startsWith("http") ? p : `${siteUrl}${p}`)) : undefined,
    sku: product.id,
    brand: { "@type": "Brand", name: "VDB Digital" },
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/products/${product.slug}`,
      priceCurrency: "EUR",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <div className="section-container py-16 md:py-24">
        <Link
          href="/products"
          className="text-sm font-medium text-marketing-textSecondary hover:text-marketing-text transition-colors"
        >
          ← Webshop
        </Link>

        <section className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-4">
            {images.length > 0 ? (
              images.map((src, i) => (
                <div
                  key={i}
                  className="group relative aspect-square max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                >
                  <Image
                    src={src}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    unoptimized={src.startsWith("http")}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
                </div>
              ))
            ) : (
              <div className="group relative aspect-square max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <Image
                  src={stockPhotos.productTvBox}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-marketing-text md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-3xl font-semibold text-marketing-text">
              €{product.price.toFixed(2)}{" "}
              <span className="text-base font-normal text-slate-500">excl. btw</span>
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {product.stock > 0 ? "In voorraad" : "Uitverkocht"} · Verzending 1–3 werkdagen
            </p>
            {product.shortDescription && (
              <p className="mt-6 text-lg text-marketing-textSecondary leading-relaxed">
                {product.shortDescription}
              </p>
            )}
            <p className="mt-4 text-marketing-textSecondary leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
            <div className="mt-10">
              <ProductBuyButton
                productId={product.id}
                productName={product.name}
                price={product.price}
                disabled={product.stock <= 0}
              />
            </div>
          </div>
        </section>

        {specEntries.length > 0 && (
          <section className="mt-24 md:mt-32">
            <h2 className="text-2xl font-semibold text-marketing-text md:text-3xl">
              Specificaties
            </h2>
            <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-surface shadow-sm">
              <table className="w-full text-left">
                <tbody>
                  {specEntries.map(([label, value], i) => (
                    <tr
                      key={label}
                      className={i % 2 === 0 ? "bg-surface" : "bg-[#EEF1F5]/50"}
                    >
                      <td className="border-b border-gray-100 px-6 py-4 font-medium text-marketing-text">
                        {label}
                      </td>
                      <td className="border-b border-gray-100 px-6 py-4 text-marketing-textSecondary">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </SiteShell>
  );
}
