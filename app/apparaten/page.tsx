import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import Image from "next/image";
import { pageMetadata } from "@/lib/metadata";
import { stockPhotos } from "@/lib/stock-photos";

const PRODUCTS = [
  {
    slug: "smart-tv-box-pro",
    name: "Smart TV Box Pro",
    description:
      "Krachtige streamingbox met 4K HDR en alle apps.",
    price: 129,
    image: stockPhotos.productTvBox,
  },
  {
    slug: "streaming-box-mini",
    name: "Streaming Box Mini",
    description: "Compacte box voor streaming in HD.",
    price: 79,
    image: stockPhotos.productStreaming,
  },
  {
    slug: "accessoires",
    name: "Accessoires",
    description: "Afstandsbedieningen, kabels en houders.",
    price: null,
    image: stockPhotos.productAccessories,
  },
];

export const metadata = pageMetadata({
  title: "Apparaten",
  description: "Smart TV- en streamingapparaten van VDB Digital. Professionele oplossingen voor thuis en kantoor.",
  path: "/apparaten",
});

export default function ApparatenPage() {
  return (
    <SiteShell>
      <div className="section-container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-marketing-text md:text-5xl">
            Smart TV & streaming
          </h1>
          <p className="mt-6 text-lg text-marketing-textSecondary">
            Kwaliteitsapparaten voor streaming en smart TV. Eenvoudig bestellen en snel geleverd.
          </p>
        </div>
        <div className="mx-auto mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product) => (
            <Link
              key={product.slug}
              href={`/apparaten/${product.slug}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-surface shadow-sm transition-all hover:border-gold/30 hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-slate-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
              </div>
              <div className="p-8">
                <h2 className="text-xl font-semibold text-marketing-text group-hover:text-gold transition-colors">
                  {product.name}
                </h2>
                <p className="mt-2 text-lg text-marketing-textSecondary">
                  {product.description}
                </p>
                {product.price !== null && (
                  <p className="mt-4 text-2xl font-semibold text-marketing-text">
                    €{product.price}
                  </p>
                )}
                <span className="mt-4 inline-block text-sm font-medium text-gold">Bekijk product →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
