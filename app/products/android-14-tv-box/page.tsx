import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { ProductGallery } from "./ProductGallery";
import { ProductOrderButton } from "./ProductOrderButton";

// Customer-facing content only. No supplier, manufacturer, or wholesale references.

const SITE_URL = "https://www.vdbdigital.nl";
const PRODUCT_URL = `${SITE_URL}/products/android-14-tv-box`;

const FEATURES = [
  "Android 14 besturingssysteem",
  "Ondersteunt 8K Ultra HD",
  "Snelle streaming",
  "Dual-band WiFi",
  "Bluetooth 5.0",
  "Geschikt voor Netflix, YouTube en IPTV",
];

const SPECS: { label: string; value: string }[] = [
  { label: "Operating system", value: "Android 14" },
  { label: "Video", value: "8K Ultra HD" },
  { label: "WiFi", value: "Dual band" },
  { label: "Bluetooth", value: "5.0" },
  { label: "Ports", value: "HDMI, USB, Ethernet" },
];

export const metadata: Metadata = {
  title: "Android 14 Smart TV Box 8K | Streaming TV Box kopen | VDB Digital",
  description:
    "Krachtige Android 14 TV Box met 8K ondersteuning en snelle WiFi. Perfect voor Netflix, YouTube en IPTV. Nu verkrijgbaar voor €89 excl. btw.",
  alternates: { canonical: "/products/android-14-tv-box" },
  openGraph: {
    title: "Android 14 Smart TV Box 8K | Streaming TV Box kopen",
    description:
      "Krachtige Android 14 TV Box met 8K ondersteuning en snelle WiFi. Perfect voor Netflix, YouTube en IPTV. €89 excl. btw.",
    url: PRODUCT_URL,
    siteName: "VDB Digital",
    type: "website",
    locale: "nl_NL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Android 14 Smart TV Box 8K | Streaming TV Box kopen",
    description:
      "Krachtige Android 14 TV Box met 8K ondersteuning. Perfect voor Netflix, YouTube en IPTV. €89 excl. btw.",
  },
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Android 14 Smart TV Box 8K",
  description:
    "Krachtige Android 14 TV Box met 8K ondersteuning, snelle WiFi en ondersteuning voor apps zoals Netflix, YouTube en IPTV.",
  url: PRODUCT_URL,
  image: `${SITE_URL}/products/tvbox1.jpg`,
  sku: "ANDROID14-TVBOX-8K",
  brand: { "@type": "Brand", name: "VDB Digital" },
  offers: {
    "@type": "Offer",
    url: PRODUCT_URL,
    priceCurrency: "EUR",
    price: 89,
    priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
  },
};

export default function Android14TvBoxPage() {
  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <div className="section-container py-8 md:py-12">
        <Link
          href="/products"
          className="text-sm font-medium text-marketing-textSecondary hover:text-marketing-text transition-colors"
        >
          ← Webshop
        </Link>

        {/* Product layout: gallery left, buy section right (Bol.com-style) */}
        <section className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-12 lg:mt-12">
          {/* Left: Gallery */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <ProductGallery />
          </div>

          {/* Right: Buy section */}
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-marketing-text md:text-3xl">
              Android 14 Smart TV Box 8K
            </h1>
            <p className="mt-4 text-2xl font-semibold text-marketing-text">
              €89,00 <span className="text-base font-normal text-slate-500">excl. btw</span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                Op voorraad
              </span>
              <span>1–3 werkdagen</span>
            </div>
            <p className="mt-6 text-marketing-textSecondary leading-relaxed">
              Krachtige Android 14 TV Box met 8K ondersteuning, snelle WiFi en ondersteuning voor
              apps zoals Netflix, YouTube en IPTV.
            </p>
            <div className="mt-8">
              <ProductOrderButton />
            </div>
          </div>
        </section>

        {/* Features: Waarom deze TV Box? */}
        <section className="mt-16 md:mt-24">
          <h2 className="text-xl font-semibold text-marketing-text md:text-2xl">
            Waarom deze TV Box?
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-marketing-textSecondary">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </section>

        {/* Specifications table */}
        <section className="mt-16 md:mt-24">
          <h2 className="text-xl font-semibold text-marketing-text md:text-2xl">
            Specificaties
          </h2>
          <div className="mt-6 overflow-x-auto overflow-hidden rounded-2xl border border-gray-200 bg-surface shadow-sm">
            <table className="w-full min-w-[280px] text-left">
              <tbody>
                {SPECS.map((row, i) => (
                  <tr
                    key={row.label}
                    className={i % 2 === 0 ? "bg-surface" : "bg-[#EEF1F5]/50"}
                  >
                    <td className="border-b border-gray-100 px-4 py-3 text-sm font-medium text-marketing-text md:px-6 md:py-4">
                      {row.label}
                    </td>
                    <td className="border-b border-gray-100 px-4 py-3 text-sm text-marketing-textSecondary md:px-6 md:py-4">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mt-16 md:mt-24 rounded-2xl border border-indigo-100 bg-indigo-50/30 p-6 md:p-8 text-center">
          <h2 className="text-lg font-semibold text-marketing-text">
            Android 14 Smart TV Box 8K
          </h2>
          <p className="mt-1 text-marketing-textSecondary">
            €89,00 excl. btw · Op voorraad · 1–3 werkdagen levertijd
          </p>
          <div className="mt-4 flex justify-center">
            <ProductOrderButton />
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
