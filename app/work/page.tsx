import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import PageTransition from "@/components/PageTransition";
import PageHero from "@/components/PageHero";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Cases",
  description:
    "Cases en projecten van VDB Digital. Van lokale diensten tot digitale infrastructuur die converteert.",
  path: "/work",
});

const projects = [
  {
    slug: "de-elektricien",
    name: "De Elektricien",
    industry: "Lokale diensten",
    summary:
      "Kalm, contact-first fundament voor een vertrouwd elektriciensmerk.",
    metric: "Stabiele stroom aan leads",
  },
];

export default function WorkPage() {
  return (
    <SiteShell>
      <PageTransition>
        <PageHero
          eyebrow="CASE"
          title="De Elektricien in detail."
          subtitle="Een geselecteerde case van een lokaal merk dat zijn digitale infrastructuur serieus neemt. Extra cases volgen, maar we beginnen bij de elektricien."
        />
        <section className="pb-28">
          <div className="section-container">
            <div className="grid gap-8 lg:grid-cols-3">
              {projects.map((project, index) => (
                <Link
                  key={project.slug}
                  href={`/work/${project.slug}`}
                  className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#171717] via-black to-black/95 p-6 shadow-[0_26px_70px_rgba(0,0,0,0.95)] transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/70 hover:shadow-gold-glow ${
                    index === 0 ? "lg:col-span-2 lg:row-span-2" : ""
                  }`}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_top,_rgba(198,169,93,0.18),transparent_60%)]" />
                  <div className="relative flex h-full flex-col justify-between gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
                            {project.industry}
                          </p>
                          <h2 className="mt-2 text-xl font-semibold text-white">
                            {project.name}
                          </h2>
                        </div>
                        <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-medium text-gold">
                          {project.metric}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300/90">
                        {project.summary}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-[11px] text-gray-400">
                      <span>Bekijk uitgebreide case</span>
                      <span className="inline-flex items-center gap-1 text-gold group-hover:translate-x-0.5 transition-transform">
                        Open <span>↗</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </PageTransition>
    </SiteShell>
  );
}

