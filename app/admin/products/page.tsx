import { redirect } from "next/navigation";
import Link from "next/link";
import { requireOwner } from "@/lib/auth";

export default async function AdminProductsPage() {
  const user = await requireOwner();
  if (!user) redirect("/dashboard");

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-6 shadow-sm backdrop-blur-xl">
      <h1 className="text-xl font-semibold text-white">Producten (Apparaten)</h1>
      <p className="mt-1 text-sm text-gray-400">
        Beheer smart TV- en streamingproducten voor de webshop. Koppel later aan voorraad en prijzen.
      </p>
      <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-gray-400">
          Productbeheer wordt hier getoond. Voeg een Product-model toe in Prisma en koppel aan Stripe of eigen voorraad voor een volledige webshop.
        </p>
        <Link
          href="/apparaten"
          className="mt-4 inline-block rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-400 hover:bg-amber-500/30"
        >
          Bekijk webshop →
        </Link>
      </div>
    </div>
  );
}
