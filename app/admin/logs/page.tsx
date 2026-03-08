import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function OwnerLogsPage() {
  const user = await requireOwner();
  if (!user) redirect("/dashboard");

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="mt-1 text-sm text-gray-400">
          Event, user, metadata, timestamp.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Metadata</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-white/5">
                  <td className="px-4 py-3 font-medium text-white">{log.event}</td>
                  <td className="px-4 py-3">{log.userId ?? "—"}</td>
                  <td className="px-4 py-3 max-w-xs truncate font-mono text-xs">
                    {log.metadata && typeof log.metadata === "object"
                      ? JSON.stringify(log.metadata)
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {logs.length === 0 && (
        <p className="py-8 text-center text-gray-500">No audit logs yet.</p>
      )}
    </div>
  );
}
