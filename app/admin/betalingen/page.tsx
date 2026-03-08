import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import Link from "next/link";

export const metadata = {
  title: "Betalingen | Admin VDB Digital",
  description: "Overzicht Stripe-facturen en abonnementen.",
};

export default async function AdminBetalingenPage() {
  const user = await requireOwner();
  if (!user) redirect("/dashboard");

  const stripe = getStripe();

  const [usersWithSubscription, invoices] = await Promise.all([
    prisma.user.findMany({
      where: { stripeSubscriptionId: { not: null }, planId: { not: null } },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
    stripe
      ? stripe.invoices.list({ limit: 30, status: "paid" }).catch(() => ({ data: [] as { id: string; customer_email: string | null; amount_paid: number; status: string; created: number; number: string | null }[] }))
      : { data: [] as { id: string; customer_email: string | null; amount_paid: number; status: string; created: number; number: string | null }[] },
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Betalingen & accounts</h1>
        <p className="mt-1 text-sm text-gray-400">
          Overzicht abonnementen (accounts) en recente Stripe-facturen. Alleen zichtbaar voor owner.
        </p>
      </div>

      <section className="rounded-2xl border border-white/10 bg-black/80 p-6 shadow-sm backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white">Accounts met abonnement</h2>
        <p className="mt-1 text-sm text-gray-400">
          Gebruikers met een actief Stripe-abonnement en gekoppeld plan.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
                <th className="pb-3 pr-4 font-medium">E-mail</th>
                <th className="pb-3 pr-4 font-medium">Plan</th>
                <th className="pb-3 pr-4 font-medium">Prijs (DB)</th>
                <th className="pb-3 font-medium">Stripe sub ID</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {usersWithSubscription.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    Nog geen accounts met abonnement.
                  </td>
                </tr>
              ) : (
                usersWithSubscription.map((u) => (
                  <tr key={u.id} className="border-b border-white/5">
                    <td className="py-3 pr-4 font-medium text-white">{u.email}</td>
                    <td className="py-3 pr-4">{u.plan?.name ?? "—"}</td>
                    <td className="py-3 pr-4">
                      {u.plan?.price != null ? `€${(u.plan.price / 100).toFixed(2)}` : "—"}
                    </td>
                    <td className="py-3 font-mono text-xs text-gray-500">
                      {u.stripeSubscriptionId?.slice(0, 20)}…
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/80 p-6 shadow-sm backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white">Recente Stripe-facturen (betaald)</h2>
        <p className="mt-1 text-sm text-gray-400">
          Laatste 30 betaalde facturen uit Stripe. Voor meer details:{" "}
          <a
            href="https://dashboard.stripe.com/invoices"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:underline"
          >
            Stripe Dashboard → Invoices
          </a>
        </p>
        {!stripe ? (
          <p className="mt-4 text-sm text-amber-500">
            Stripe is niet geconfigureerd (STRIPE_SECRET_KEY ontbreekt). Facturen zijn alleen in het Stripe Dashboard zichtbaar.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
                  <th className="pb-3 pr-4 font-medium">Factuurnr.</th>
                  <th className="pb-3 pr-4 font-medium">Klant</th>
                  <th className="pb-3 pr-4 font-medium">Bedrag</th>
                  <th className="pb-3 pr-4 font-medium">Datum</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {invoices.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-500">
                      Geen betaalde facturen gevonden.
                    </td>
                  </tr>
                ) : (
                  invoices.data.map((inv) => (
                    <tr key={inv.id} className="border-b border-white/5">
                      <td className="py-3 pr-4 font-mono text-xs text-white">{inv.number ?? inv.id.slice(0, 12)}</td>
                      <td className="py-3 pr-4">{inv.customer_email ?? "—"}</td>
                      <td className="py-3 pr-4">€{((inv.amount_paid ?? 0) / 100).toFixed(2)}</td>
                      <td className="py-3 pr-4">
                        {new Date((inv.created ?? 0) * 1000).toLocaleDateString("nl-NL")}
                      </td>
                      <td className="py-3 capitalize">{inv.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/admin/users"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          ← Alle accounts (Users)
        </Link>
        <Link
          href="/admin/finance"
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Finance (MRR & kosten)
        </Link>
      </div>
    </div>
  );
}
