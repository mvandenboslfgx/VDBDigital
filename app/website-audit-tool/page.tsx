import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { Button } from "@/components/ui";

export const metadata = {
  title: "Website-audit tool — Scan SEO, performance, UX & conversie | VDB Digital",
  description:
    "Gratis website-audit in seconden. Ontvang scores voor SEO, performance, UX en conversie plus actiegerichte adviezen. Start nu.",
  openGraph: {
    title: "Website-audit tool | VDB Digital",
    description: "Scan je website op SEO, performance, UX en conversie. Duidelijke scores en adviezen.",
  },
};

export default function WebsiteAuditToolLandingPage() {
  return (
    <SiteShell>
      <div className="section-container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-heading text-amber-400/90">Website-audit</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
            Ontdek waarom je website geen klanten oplevert
          </h1>
          <p className="mt-6 text-lg text-zinc-400">
            Eén scan: SEO, performance, UX en conversie. Duidelijke scores en actiegerichte adviezen—geen jargon.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/tools/website-audit">
              <Button size="lg">Start gratis audit</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" size="lg">
                Bekijk prijzen
              </Button>
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-20 max-w-2xl rounded-2xl border border-white/[0.06] bg-[#111113] p-8">
          <h2 className="text-lg font-semibold text-white">Wat je krijgt</h2>
          <ul className="mt-4 space-y-2 text-zinc-400">
            <li>· SEO-score en verbeterpunten</li>
            <li>· Performance-analyse</li>
            <li>· UX- en conversie-inzichten</li>
            <li>· AI-samenvatting met prioriteiten</li>
          </ul>
        </div>
      </div>
    </SiteShell>
  );
}
