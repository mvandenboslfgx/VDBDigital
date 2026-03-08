import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { Button } from "@/components/ui";

export const metadata = {
  title: "AI Copy Generator — Betere teksten, headlines & CTAs | VDB Digital",
  description:
    "Optimaliseer je copy met AI. Sterkere headlines, betere oproepen tot actie en leesbaarheidstips. Onderdeel van het AI Marketing Toolkit.",
  openGraph: {
    title: "AI Copy Generator | VDB Digital",
    description: "Verbeterde copy, headlines en CTAs gegenereerd door AI.",
  },
};

export default function AICopyGeneratorLandingPage() {
  return (
    <SiteShell>
      <div className="section-container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-heading text-amber-400/90">Copy Optimizer</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
            Tekst die converteert
          </h1>
          <p className="mt-6 text-lg text-zinc-400">
            Plak je copy en ontvang verbeterde teksten, sterkere headlines en betere oproepen tot actie—gegenereerd door AI.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/tools/copy-optimizer">
              <Button size="lg">Copy optimaliseren</Button>
            </Link>
            <Link href="/tools">
              <Button variant="ghost" size="lg">
                Alle tools
              </Button>
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-20 max-w-2xl rounded-2xl border border-white/[0.06] bg-[#111113] p-8">
          <h2 className="text-lg font-semibold text-white">Wat je krijgt</h2>
          <ul className="mt-4 space-y-2 text-zinc-400">
            <li>· Verbeterde copy op basis van je tekst</li>
            <li>· Alternatieve headlines</li>
            <li>· CTA-voorstellen</li>
            <li>· Leesbaarheidstips</li>
          </ul>
        </div>
      </div>
    </SiteShell>
  );
}
