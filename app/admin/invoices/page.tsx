import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InvoiceActions from "@/components/admin/InvoiceActions";
import CreateInvoiceForm from "@/components/admin/CreateInvoiceForm";

export default async function AdminInvoicesPage() {
  const user = await requireUser("admin");
  if (!user) redirect("/login");

  const [invoices, clients] = await Promise.all([
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: true },
    }),
    prisma.client.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/admin/dashboard" className="text-sm text-gray-400 hover:text-indigo-400">
        ← Dashboard
      </Link>
      <section className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="section-heading">Invoices</h1>
            <h2 className="section-title">Invoice management</h2>
            <p className="mt-1 text-sm text-gray-400">
              Client, amount, currency, status, due date. Create, mark paid, export PDF.
            </p>
          </div>
          <CreateInvoiceForm clients={clients} />
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
                <th className="pb-3 pr-4 font-medium">Client</th>
                <th className="pb-3 pr-4 font-medium">Amount</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Due date</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-white/5">
                  <td className="py-3 pr-4 font-medium text-white">
                    {inv.client.name}
                  </td>
                  <td className="py-3 pr-4">
                    €{(inv.amount / 100).toLocaleString()} {inv.currency.toUpperCase()}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        inv.status === "paid"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : inv.status === "overdue"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-white/10 text-gray-300"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-500">
                    {inv.dueDate
                      ? new Date(inv.dueDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="py-3 text-right">
                    <InvoiceActions invoiceId={inv.id} status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {invoices.length === 0 && (
          <p className="py-8 text-center text-gray-500">No invoices yet.</p>
        )}
      </section>
    </div>
  );
}
