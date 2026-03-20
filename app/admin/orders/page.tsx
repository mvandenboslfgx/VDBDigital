import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUS_OPTIONS = ["pending", "paid", "failed", "refunded", "cancelled"] as const;
type ProductOrderStatus = (typeof STATUS_OPTIONS)[number];

function isValidStatus(value: string | undefined): value is ProductOrderStatus {
  return !!value && STATUS_OPTIONS.includes(value as ProductOrderStatus);
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireOwner();
  if (!user) redirect("/dashboard");
  const { status } = await searchParams;
  const statusFilter = isValidStatus(status) ? status : undefined;

  const [orders, totalOrders, failed24h] = await Promise.all([
    prisma.productOrder.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        status: true,
        totalCents: true,
        email: true,
        failureReason: true,
        createdAt: true,
      },
    }),
    prisma.productOrder.count(),
    prisma.productOrder.count({
      where: {
        status: "failed",
        updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-6 shadow-sm backdrop-blur-xl">
      <h1 className="text-xl font-semibold text-white">Bestellingen</h1>
      <p className="mt-1 text-sm text-gray-400">
        Operations-overzicht met statusfilters, failed insights en snelle drill-down.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/60 p-4">
          <p className="text-xs text-gray-400">Totaal orders</p>
          <p className="mt-1 text-2xl font-semibold text-white">{totalOrders}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/60 p-4">
          <p className="text-xs text-gray-400">Failed laatste 24u</p>
          <p className="mt-1 text-2xl font-semibold text-rose-300">{failed24h}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/60 p-4">
          <p className="text-xs text-gray-400">Actieve filter</p>
          <p className="mt-1 text-2xl font-semibold text-white">{statusFilter ?? "alle"}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-lg border px-3 py-1.5 text-xs ${
            !statusFilter
              ? "border-indigo-400 bg-indigo-500/20 text-indigo-200"
              : "border-white/15 text-gray-300 hover:bg-white/5"
          }`}
        >
          Alle
        </Link>
        {STATUS_OPTIONS.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-lg border px-3 py-1.5 text-xs ${
              statusFilter === s
                ? "border-indigo-400 bg-indigo-500/20 text-indigo-200"
                : "border-white/15 text-gray-300 hover:bg-white/5"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-2">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="block rounded-lg border border-white/10 bg-black/60 px-4 py-3 transition hover:bg-black/40"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">
                  #{order.id.slice(0, 8)} ·{" "}
                  {(order.totalCents / 100).toLocaleString("nl-NL", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </p>
                <p className="text-xs text-gray-400">{order.email ?? "onbekende e-mail"}</p>
                {order.failureReason && (
                  <p className="mt-1 text-xs text-rose-300">Fout: {order.failureReason}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-gray-300">{order.status}</p>
                <p className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleString("nl-NL")}
                </p>
              </div>
            </div>
          </Link>
        ))}
        {orders.length === 0 && (
          <p className="rounded-lg border border-white/10 bg-black/60 px-4 py-8 text-center text-sm text-gray-400">
            Geen orders gevonden voor deze filter.
          </p>
        )}
      </div>
    </div>
  );
}
