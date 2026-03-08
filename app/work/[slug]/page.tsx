import SiteShell from "@/components/SiteShell";
import PageTransition from "@/components/PageTransition";
import PageHero from "@/components/PageHero";
import CasePreview from "@/components/CasePreview";
import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";

const projects = {
  "de-elektricien": {
    name: "De Elektricien",
    industry: "Local Services",
    role: "End-to-end digital presence",
    summary:
      "A calm, contact-first website for a local electrical company where clarity and trust beat spectacle.",
    liveUrl: "https://de-elektricien.nl",
  },
} as const;

type ProjectKey = keyof typeof projects;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects[slug as ProjectKey];
  if (!project) {
    return pageMetadata({
      title: "Case",
      description: "Case study van VDB Digital.",
      path: `/work/${slug}`,
    });
  }
  return pageMetadata({
    title: project.name,
    description: project.summary,
    path: `/work/${slug}`,
  });
}

export default async function WorkCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects[slug as ProjectKey];

  if (!project) {
    const fallbackUrl = "https://de-elektricien.nl";

    return (
      <SiteShell>
        <PageTransition>
          <PageHero
            eyebrow="CASE"
            title="Live preview · De Elektricien"
            subtitle="Deze case is (nog) niet uitgewerkt als volledige studie, maar je kunt hieronder de live site van De Elektricien bekijken."
          />
          <section className="pb-24">
            <div className="section-container space-y-6">
              <div className="mt-2 rounded-3xl border border-white/12 bg-black/90 shadow-[0_26px_70px_rgba(0,0,0,0.95)]">
                <div className="border-b border-white/10 px-4 py-2 text-left text-[11px] uppercase tracking-[0.18em] text-gray-500 sm:px-6">
                  Website preview · de-elektricien.nl
                </div>
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-b-3xl bg-black">
                  <CasePreview
                    url={fallbackUrl}
                    alt="De Elektricien — website preview"
                    liveUrl={fallbackUrl}
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Screenshot van de live homepage. Klik op &quot;Open volledige site&quot;
                voor de interactieve versie.
              </div>
              <div className="pt-4 flex flex-wrap gap-4 text-sm">
                <a
                  href={fallbackUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                >
                  Open volledige site
                </a>
                <Link
                  href="/work"
                  className="btn-ghost text-xs sm:text-sm"
                >
                  Terug naar cases
                </Link>
              </div>
            </div>
          </section>
        </PageTransition>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageTransition>
        <PageHero
          eyebrow="FEATURED PROJECT"
          title={project.name}
          subtitle={project.summary}
        />
        <section className="pb-24">
          <div className="section-container space-y-6">
            <div className="grid gap-4 text-sm text-gray-300/90 sm:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                  Industry
                </p>
                <p className="mt-1 text-sm text-gray-200">{project.industry}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                  Role
                </p>
                <p className="mt-1 text-sm text-gray-200">{project.role}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                  Status
                </p>
                <p className="mt-1 text-sm text-gray-200">
                  Live and actively in use
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/12 bg-black/90 shadow-[0_26px_70px_rgba(0,0,0,0.95)]">
              <div className="border-b border-white/10 px-4 py-2 text-left text-[11px] uppercase tracking-[0.18em] text-gray-500 sm:px-6">
                Website preview · de-elektricien.nl
              </div>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-b-3xl bg-black">
                <CasePreview
                  url={project.liveUrl}
                  alt={`${project.name} — website preview`}
                  liveUrl={project.liveUrl}
                />
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Screenshot van de live homepage. Klik op &quot;Open volledige site&quot;
              voor de interactieve versie.
            </div>

            <div className="pt-4 flex flex-wrap gap-4 text-sm">
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                Open volledige site
              </a>
              <Link href="/contact" className="btn-ghost text-xs sm:text-sm">
                Vergelijkbare infrastructuur bespreken
              </Link>
            </div>
          </div>
        </section>
      </PageTransition>
    </SiteShell>
  );
}

