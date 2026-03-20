import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminWebsitesPage() {
  const user = await requireUser("admin");
  if (!user) redirect("/login");

  const websites = await prisma.website.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true },
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
        <h1 className="section-heading">Websites</h1>
        <h2 className="section-title">Client websites</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
                <th className="pb-3 pr-4 font-medium">Domain</th>
                <th className="pb-3 pr-4 font-medium">Client</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Preview</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {websites.map((w) => (
                <tr key={w.id} className="border-b border-white/5">
                  <td className="py-3 pr-4 font-medium text-white">{w.domain}</td>
                  <td className="py-3 pr-4">{w.client.name}</td>
                  <td className="py-3 pr-4 capitalize">{w.status.replace("_", " ")}</td>
                  <td className="py-3">
                    {w.previewUrl ? (
                      <a
                        href={w.previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:underline"
                      >
                        Open
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {websites.length === 0 && (
          <p className="py-8 text-center text-gray-500">No websites yet.</p>
        )}
    </div>
  );
}
