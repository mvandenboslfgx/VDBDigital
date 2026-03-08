import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminClientsPage() {
  const user = await requireUser("admin");
  if (!user) redirect("/login");

  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { projects: true, invoices: true } },
    },
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
      <h1 className="section-heading">Clients</h1>
      <h2 className="section-title">Client directory</h2>
      <p className="mt-1 text-sm text-gray-400">
        Clients linked to projects and invoices.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
              <th className="pb-3 pr-4 font-medium">Name</th>
              <th className="pb-3 pr-4 font-medium">Email</th>
              <th className="pb-3 pr-4 font-medium">Projects</th>
              <th className="pb-3 pr-4 font-medium">Invoices</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-white/5">
                <td className="py-3 pr-4 font-medium text-white">{c.name}</td>
                <td className="py-3 pr-4">{c.email}</td>
                <td className="py-3 pr-4">{c._count.projects}</td>
                <td className="py-3 pr-4">{c._count.invoices}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <p className="py-8 text-center text-gray-500">No clients yet. Convert leads to create clients.</p>
        )}
      </div>
    </div>
  );
}
