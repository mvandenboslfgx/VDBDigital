import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PortalInvoicesPage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  const client = await prisma.client.findFirst({ where: { userId: user.id } });
  if (!client) redirect("/portal");

  const invoices = await prisma.invoice.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="glass-panel border-white/10 bg-black/80 p-6">
      <h1 className="section-heading">My Invoices</h1>
      <h2 className="section-title">Your invoices</h2>
      <div className="mt-6 space-y-3">
        {invoices.map((inv) => (
          <div key={inv.id} className="rounded-xl border border-white/10 bg-black/60 p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-white">€{(inv.amount / 100).toLocaleString()} {inv.description && `· ${inv.description}`}</p>
              <p className="text-sm text-gray-400">Due: {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</p>
            </div>
            <span className={`text-sm font-medium ${inv.status === "paid" ? "text-emerald-400" : inv.status === "overdue" ? "text-red-400" : "text-gray-400"}`}>{inv.status}</span>
          </div>
        ))}
        {invoices.length === 0 && <p className="text-gray-500">No invoices yet.</p>}
      </div>
    </div>
  );
}
