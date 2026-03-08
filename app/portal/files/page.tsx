import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PortalFilesPage() {
  const user = await requireUser();
  if (!user) redirect("/login");
  const client = await prisma.client.findFirst({ where: { userId: user.id } });
  if (!client) redirect("/portal");

  const projects = await prisma.project.findMany({
    where: { clientId: client.id },
    include: { files: true },
  });
  const files = projects.flatMap((p) => p.files.map((f) => ({ ...f, projectName: p.name })));

  return (
    <div className="glass-panel border-white/10 bg-black/80 p-6">
      <h1 className="section-heading">My Files</h1>
      <h2 className="section-title">Project files</h2>
      <div className="mt-6 space-y-3">
        {files.map((f) => (
          <div key={f.id} className="rounded-xl border border-white/10 bg-black/60 p-4">
            <p className="font-medium text-white">{f.filename}</p>
            <p className="text-xs text-gray-500">{f.projectName} · {(f.size / 1024).toFixed(1)} KB</p>
          </div>
        ))}
        {files.length === 0 && <p className="text-gray-500">No files yet.</p>}
      </div>
    </div>
  );
}
