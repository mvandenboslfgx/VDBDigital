import SiteShell from "@/components/SiteShell";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Projects | VDB Digital",
  description: "Selected projects and case studies by VDB Digital.",
};

export default async function ProjectsShowcasePage() {
  const projects = await prisma.project.findMany({
    where: { showcase: true },
    include: { client: true, website: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <SiteShell>
      <div className="section-container py-16">
        <h1 className="section-heading">Projects</h1>
        <h2 className="section-title mt-2">Selected work</h2>
        <p className="mt-4 max-w-2xl text-gray-400">
          A selection of projects we are proud of. Each one is tailored to the client&apos;s brand and goals.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.length === 0 ? (
            <p className="col-span-full text-gray-500">No showcase projects yet. Check back later.</p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="rounded-2xl border border-white/10 bg-black/60 p-6 transition hover:border-gold/30"
              >
                <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                <p className="mt-1 text-sm text-gray-400">{project.client.name}</p>
                {project.website?.previewUrl && (
                  <a
                    href={project.website.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm text-gold hover:underline"
                  >
                    View site →
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </SiteShell>
  );
}
