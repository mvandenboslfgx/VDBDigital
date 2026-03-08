import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PortalProjectsPage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  const client = await prisma.client.findFirst({ where: { userId: user.id } });
  if (!client) redirect("/portal");

  const projects = await prisma.project.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
    include: { website: true },
  });

  return (
    <div className="glass-panel border-white/10 bg-black/80 p-6">
      <h1 className="section-heading">My Projects</h1>
      <h2 className="section-title">Your projects</h2>
      <div className="mt-6 space-y-3">
        {projects.map((p) => (
          <div key={p.id} className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="font-semibold text-white">{p.name}</p>
            <p className="text-sm text-gray-400">Status: {p.status}</p>
            {p.website?.previewUrl && (
              <a href={p.website.previewUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-gold hover:underline">View site →</a>
            )}
          </div>
        ))}
        {projects.length === 0 && <p className="text-gray-500">No projects yet.</p>}
      </div>
    </div>
  );
}
