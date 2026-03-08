import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShowcaseToggle } from "@/components/admin/ShowcaseToggle";

export default async function AdminProjectsPage() {
  const user = await requireUser("admin");
  if (!user) redirect("/login");

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: true },
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl">
      <h1 className="section-heading">Projects</h1>
      <h2 className="section-title">All projects</h2>
      <p className="mt-1 text-sm text-gray-400">
        Mark as showcase to display on the public /projects page.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
              <th className="pb-3 pr-4 font-medium">Project</th>
              <th className="pb-3 pr-4 font-medium">Client</th>
              <th className="pb-3 pr-4 font-medium">Status</th>
              <th className="pb-3 pr-4 font-medium">Created</th>
              <th className="pb-3 font-medium">Showcase</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="py-3 pr-4 font-medium text-white">{p.name}</td>
                <td className="py-3 pr-4">{p.client.name}</td>
                <td className="py-3 pr-4">
                  <span className="rounded bg-white/10 px-2 py-0.5 text-xs">{p.status}</span>
                </td>
                <td className="py-3 pr-4 text-gray-500">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3">
                  <ShowcaseToggle projectId={p.id} showcase={p.showcase} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projects.length === 0 && (
          <p className="py-8 text-center text-gray-500">No projects yet.</p>
        )}
      </div>
    </div>
  );
}
