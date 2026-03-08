import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { CartClient } from "./CartClient";

export const metadata = pageMetadata({
  title: "Winkelwagen",
  description: "Bekijk je winkelwagen en ga door naar afrekenen.",
  path: "/cart",
});

export default function CartPage() {
  return (
    <SiteShell>
      <div className="section-container py-24 md:py-32">
        <h1 className="text-3xl font-semibold text-marketing-text md:text-4xl">
          Winkelwagen
        </h1>
        <p className="mt-2 text-lg text-marketing-textSecondary">
          Bekijk je producten en ga door naar afrekenen.
        </p>
        <CartClient />
        <div className="mt-8">
          <Link
            href="/apparaten"
            className="text-gold font-medium hover:text-goldHover transition-colors"
          >
            ← Verder winkelen
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
