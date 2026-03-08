import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/metadata";
import { AddToCartButton } from "./AddToCartButton";

const PRODUCTS: Record<
  string,
  { name: string; description: string; price: number | null; features: string[] }
> = {
  "smart-tv-box-pro": {
    name: "Smart TV Box Pro",
    description: "Krachtige streamingbox met 4K HDR, alle populaire apps en een snelle interface. Ideaal voor thuis en kantoor.",
    price: 129,
    features: ["4K HDR", "Alle streaming-apps", "Voice remote", "Snel en stabiel"],
  },
  "streaming-box-mini": {
    name: "Streaming Box Mini",
    description: "Compacte box voor streaming in HD. Eenvoudig in gebruik en betaalbaar.",
    price: 79,
    features: ["HD streaming", "Compact design", "Eenvoudige bediening", "Energiezuinig"],
  },
  accessoires: {
    name: "Accessoires",
    description: "Afstandsbedieningen, HDMI-kabels, wandhouders en meer voor je setup.",
    price: null,
    features: ["Compatibel met onze apparaten", "Snelle levering", "2 jaar garantie"],
  },
};

export async function generateStaticParams() {
  return Object.keys(PRODUCTS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = PRODUCTS[slug];
  if (!product) return {};
  return pageMetadata({
    title: product.name,
    description: product.description,
    path: `/apparaten/${slug}`,
  });
}

export default async function ApparatenProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = PRODUCTS[slug];
  if (!product) notFound();

  return (
    <SiteShell>
      <div className="section-container py-24 md:py-32">
        <Link
          href="/apparaten"
          className="text-sm font-medium text-marketing-textSecondary hover:text-marketing-text transition-colors"
        >
          ← Apparaten
        </Link>
        <div className="mt-10 grid gap-12 lg:grid-cols-2">
          <div className="aspect-square max-w-lg rounded-2xl bg-slate-100 flex items-center justify-center">
            <span className="text-marketing-textSecondary">Productafbeelding</span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-marketing-text md:text-4xl">
              {product.name}
            </h1>
            {product.price !== null && (
              <p className="mt-4 text-3xl font-semibold text-marketing-text">
                €{product.price}
              </p>
            )}
            <p className="mt-6 text-lg text-marketing-textSecondary leading-relaxed">
              {product.description}
            </p>
            <ul className="mt-6 space-y-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-marketing-text">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-4">
              <AddToCartButton slug={slug} name={product.name} price={product.price} />
              {product.price !== null && (
                <Link
                  href={`/checkout?item=${slug}`}
                  className="inline-flex items-center justify-center rounded-xl bg-gold px-8 py-4 text-lg font-semibold text-black transition-colors hover:bg-goldHover"
                >
                  Direct kopen
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
