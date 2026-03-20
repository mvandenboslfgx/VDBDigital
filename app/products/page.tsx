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

type Props = {
  searchParams?: {
    checkout?: string;
    session_id?: string;
  };
};

export default async function ProductsPage({ searchParams }: Props) {
  let products: { id: string; name: string; slug: string; price: number; shortDescription: string | null }[] = [];
  try {
    products = await prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, name: true, slug: true, price: true, shortDescription: true },
    });
  } catch {
    // Table may not exist yet
  }

  const checkoutSuccess = searchParams?.checkout === "success" && typeof searchParams.session_id === "string";
  let paymentBanner:
    | null
    | { statusLabel: string; message: string } = null;

  if (checkoutSuccess) {
    const sessionId = searchParams!.session_id;
    try {
      const order = await prisma.productOrder.findUnique({
        where: { stripeCheckoutSessionId: sessionId },
        select: { status: true },
      });

      if (order) {
        const statusLabel =
          order.status === "paid"
            ? "Betaling bevestigd"
            : order.status === "pending"
              ? "Betaling ontvangen"
              : "Betaling ontvangen (verwerking mogelijk mislukt)";

        const message =
          order.status === "paid"
            ? "Dank voor je bestelling. Je order is betaald en wordt verwerkt."
            : "Dank voor je bestelling. We verwerken je order en nemen contact op als er iets misgaat.";

        paymentBanner = { statusLabel, message };
      } else {
        paymentBanner = {
          statusLabel: "Betaling bevestigd",
          message: "Dank voor je bestelling. (We konden je order nog niet terugvinden.)",
        };
      }
    } catch {
      paymentBanner = {
        statusLabel: "Betaling bevestigd",
        message: "Dank voor je bestelling. (Orderstatus onbekend.)",
      };
    }
  }

  return (
    <SiteShell>
      <div className="section-container py-24 md:py-32">
        {paymentBanner && (
          <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 text-emerald-900">
            <div className="text-lg font-semibold">{paymentBanner.statusLabel}</div>
            <div className="mt-1 text-sm text-emerald-800">{paymentBanner.message}</div>
          </div>
        )}
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
              <Link href="/admin/products" className="text-indigo-600 hover:underline">admin dashboard</Link>.
            </div>
          ) : (
            products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group rounded-2xl border border-gray-200 bg-surface p-6 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
              >
                <div className="aspect-square rounded-xl bg-slate-100 flex items-center justify-center">
                  <span className="text-sm text-marketing-textSecondary">Product</span>
                </div>
                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-marketing-text group-hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h2>
                  <p className="mt-2 text-marketing-textSecondary line-clamp-2">
                    {product.shortDescription ?? "Bekijk product voor details."}
                  </p>
                  <p className="mt-4 text-2xl font-semibold text-marketing-text">
                    €{product.price.toFixed(2)}{" "}
                    <span className="text-sm font-normal text-slate-500">excl. btw</span>
                  </p>
                  <span className="mt-4 inline-block text-sm font-medium text-indigo-600">
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
