import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { CheckoutClient } from "./CheckoutClient";

export const metadata = pageMetadata({
  title: "Afrekenen",
  description: "Rond je bestelling af met een veilige betaling.",
  path: "/checkout",
});

export default function CheckoutPage() {
  return (
    <SiteShell>
      <div className="section-container py-24 md:py-32">
        <h1 className="text-3xl font-semibold text-marketing-text md:text-4xl">
          Afrekenen
        </h1>
        <p className="mt-2 text-lg text-marketing-textSecondary">
          Veilig betalen via Stripe. Je gegevens worden niet opgeslagen op onze servers.
        </p>
        <CheckoutClient />
        <div className="mt-8">
          <Link
            href="/cart"
            className="text-gold font-medium hover:text-goldHover transition-colors"
          >
            ← Terug naar winkelwagen
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
