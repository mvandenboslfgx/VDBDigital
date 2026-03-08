import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardProjectsPage() {
  const user = await requireUser();
  if (!user) return null;

  const client = await prisma.client.findFirst({ where: { userId: user.id } });

  if (!client) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Projects</h1>
          <p className="mt-1 text-gray-400">Your active projects and progress.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center shadow-sm">
          <p className="text-gray-400">No project dashboard yet.</p>
          <p className="mt-2 text-sm text-gray-500">
            When you become a customer, your projects will appear here.
          </p>
          <Link href="/contact" className="mt-6 inline-block rounded-full bg-gold px-6 py-3 text-sm font-medium text-black hover:bg-gold/90">
            Get in touch
          </Link>
        </div>
      </div>
    );
  }

  const [projects, invoices] = await Promise.all([
    prisma.project.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.invoice.findMany({
      where: { clientId: client.id },
      orderBy: { createdAt: "desc" },
      take: 5 },
    ),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Projects</h1>
        <p className="mt-1 text-gray-400">Your projects and invoices.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Recent projects</h2>
          <ul className="mt-4 space-y-3">
            {projects.map((p) => (
              <li key={p.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-4 py-3">
                <span className="font-medium text-white">{p.name}</span>
                <span className="text-xs text-gray-400">{p.status}</span>
              </li>
            ))}
            {projects.length === 0 && <li className="text-sm text-gray-500">No projects yet.</li>}
          </ul>
          <Link href="/portal/projects" className="mt-4 inline-block text-sm text-gold hover:underline">
            View all in portal →
          </Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Recent invoices</h2>
          <ul className="mt-4 space-y-3">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-4 py-3">
                <span className="text-white">€{(inv.amount / 100).toLocaleString()}</span>
                <span className="text-xs text-gray-400">{inv.status}</span>
              </li>
            ))}
            {invoices.length === 0 && <li className="text-sm text-gray-500">No invoices yet.</li>}
          </ul>
          <Link href="/portal/invoices" className="mt-4 inline-block text-sm text-gold hover:underline">
            View all in portal →
          </Link>
        </div>
      </div>
    </div>
  );
}
