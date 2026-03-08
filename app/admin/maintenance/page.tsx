import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminMaintenancePage() {
  const user = await requireUser("admin");
  if (!user) redirect("/login");

  const logs = await prisma.maintenanceLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { website: { include: { client: true } } },
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
      <h1 className="section-heading">Maintenance</h1>
      <h2 className="section-title">Website maintenance logs</h2>
      <p className="mt-1 text-sm text-gray-400">
        Update, backup, security check, and fix entries per website.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
              <th className="pb-3 pr-4 font-medium">Website</th>
              <th className="pb-3 pr-4 font-medium">Client</th>
              <th className="pb-3 pr-4 font-medium">Type</th>
              <th className="pb-3 pr-4 font-medium">Note</th>
              <th className="pb-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-white/5">
                <td className="py-3 pr-4 font-medium text-white">{log.website.domain}</td>
                <td className="py-3 pr-4">{log.website.client.name}</td>
                <td className="py-3 pr-4">{log.type.replace("_", " ")}</td>
                <td className="py-3 pr-4">{log.note ?? "—"}</td>
                <td className="py-3 text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <p className="py-8 text-center text-gray-500">No maintenance logs yet.</p>
        )}
      </div>
    </div>
  );
}
