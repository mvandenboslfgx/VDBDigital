import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export default async function PortalDashboardPage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (isAdmin(user)) redirect("/admin");

  const client = await prisma.client.findFirst({ where: { userId: user.id } });
  if (!client) {
    return (
      <div className="glass-panel border-white/10 bg-black/80 p-6">
        <h1 className="section-heading">Portal</h1>
        <p className="mt-3 text-gray-400">No client profile linked. Contact support.</p>
      </div>
    );
  }

  const [projects, invoices] = await Promise.all([
    prisma.project.findMany({ where: { clientId: client.id }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.invoice.findMany({ where: { clientId: client.id }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  return (
    <div className="space-y-8">
      <div className="glass-panel border-white/10 bg-black/80 p-6">
        <h1 className="section-heading">Portal</h1>
        <h2 className="section-title">Welcome, {client.name}</h2>
        <p className="mt-3 text-sm text-gray-400">Overview of your projects and invoices.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="glass-panel border-white/10 bg-black/80 p-6">
          <h3 className="text-sm font-semibold text-white">Recent projects</h3>
          <ul className="mt-3 space-y-2">
            {projects.map((p) => (
              <li key={p.id} className="text-sm text-gray-300">{p.name} · {p.status}</li>
            ))}
            {projects.length === 0 && <li className="text-gray-500">No projects yet.</li>}
          </ul>
          <Link href="/portal/projects" className="mt-3 inline-block text-sm text-gold hover:underline">View all →</Link>
        </div>
        <div className="glass-panel border-white/10 bg-black/80 p-6">
          <h3 className="text-sm font-semibold text-white">Recent invoices</h3>
          <ul className="mt-3 space-y-2">
            {invoices.map((inv) => (
              <li key={inv.id} className="text-sm text-gray-300">€{(inv.amount / 100).toLocaleString()} · {inv.status}</li>
            ))}
            {invoices.length === 0 && <li className="text-gray-500">No invoices yet.</li>}
          </ul>
          <Link href="/portal/invoices" className="mt-3 inline-block text-sm text-gold hover:underline">View all →</Link>
        </div>
      </div>
    </div>
  );
}
