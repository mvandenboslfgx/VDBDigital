import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RetryOrderButton } from "./RetryOrderButton";

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/60 p-4">
      <p className="text-xs text-gray-400">{title}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireOwner();
  if (!user) redirect("/dashboard");
  const { id } = await params;

  const order = await prisma.productOrder.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      totalCents: true,
      currency: true,
      email: true,
      userId: true,
      stripeCheckoutSessionId: true,
      stripePaymentIntentId: true,
      failureReason: true,
      lineItems: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!order) return notFound();

  return (
    <div className="space-y-6 rounded-2xl border border-white/10 bg-black/80 p-6 shadow-sm backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/admin/orders" className="text-xs text-indigo-300 hover:underline">
            ← Terug naar orders
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-white">Order #{order.id.slice(0, 8)}</h1>
        </div>
        <RetryOrderButton orderId={order.id} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Status" value={order.status} />
        <StatCard
          title="Bedrag"
          value={(order.totalCents / 100).toLocaleString("nl-NL", {
            style: "currency",
            currency: "EUR",
          })}
        />
        <StatCard title="Email" value={order.email ?? "—"} />
        <StatCard title="Aangemaakt" value={new Date(order.createdAt).toLocaleString("nl-NL")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard title="Stripe session" value={order.stripeCheckoutSessionId ?? "—"} />
        <StatCard title="Payment intent" value={order.stripePaymentIntentId ?? "—"} />
        <StatCard title="User ID" value={order.userId ?? "—"} />
        <StatCard title="Laatst bijgewerkt" value={new Date(order.updatedAt).toLocaleString("nl-NL")} />
      </div>

      {order.failureReason && (
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 p-4">
          <p className="text-xs uppercase tracking-wide text-rose-200">Failure reason</p>
          <p className="mt-1 text-sm text-rose-100">{order.failureReason}</p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/60 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Line items</p>
          <pre className="mt-2 overflow-x-auto text-xs text-gray-200">
            {JSON.stringify(order.lineItems, null, 2)}
          </pre>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/60 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Metadata</p>
          <pre className="mt-2 overflow-x-auto text-xs text-gray-200">
            {JSON.stringify(order.metadata ?? {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
