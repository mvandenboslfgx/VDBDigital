import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";

export default async function AdminOrdersPage() {
  const user = await requireOwner();
  if (!user) redirect("/dashboard");

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-6 shadow-sm backdrop-blur-xl">
      <h1 className="text-xl font-semibold text-white">Bestellingen</h1>
      <p className="mt-1 text-sm text-gray-400">
        Overzicht van hardware- en webshopbestellingen. Koppel aan Stripe Checkout en webhooks voor live orders.
      </p>
      <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-gray-400">
          Bestellingen verschijnen hier zodra Stripe Checkout-sessies en webhooks voor de hardware-shop zijn geïntegreerd.
        </p>
      </div>
    </div>
  );
}
