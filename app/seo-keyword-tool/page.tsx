import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { Button } from "@/components/ui";

export const metadata = {
  title: "SEO Keyword tool — Vind zoekwoorden & content-ideeën | VDB Digital",
  description:
    "Vind zoekwoorden op basis van je website of een keyword. Zoekintentie en content-suggesties inbegrepen. Onderdeel van het AI Marketing Toolkit.",
  openGraph: {
    title: "SEO Keyword tool | VDB Digital",
    description: "Keyword-ideeën, zoekintentie en content-suggesties voor betere SEO.",
  },
};

export default function SeoKeywordToolLandingPage() {
  return (
    <SiteShell>
      <div className="section-container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-heading text-amber-400/90">SEO Keyword Finder</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl lg:text-5xl">
            Vind zoekwoorden die converteren
          </h1>
          <p className="mt-6 text-lg text-zinc-400">
            Voer je website of een keyword in. Ontvang keyword-ideeën, zoekintentie en content-suggesties—gegenereerd door AI.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/tools/seo-keyword-finder">
              <Button size="lg">Start keyword-analyse</Button>
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
            <li>· Relevante zoekwoorden op basis van website of keyword</li>
            <li>· Zoekintentie (informational, transactional, commercial)</li>
            <li>· Content-suggesties per keyword</li>
          </ul>
        </div>
      </div>
    </SiteShell>
  );
}
