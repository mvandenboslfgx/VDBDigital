import SiteShell from "@/components/SiteShell";
import { pageMetadata } from "@/lib/metadata";
import { COMPANY_EMAIL, COMPANY_EMAIL_MAILTO, LINKEDIN_URL, INSTAGRAM_URL } from "@/lib/company";
import Link from "next/link";

export const metadata = pageMetadata({
  title: "Over ons",
  description:
    "VDB Digital biedt AI-gestuurde website-analyse en groei-inzichten. Wij helpen ondernemers en teams hun website te verbeteren met duidelijke data.",
  path: "/over-ons",
});

export default function OverOnsPage() {
  return (
    <SiteShell>
      <div className="section-container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-marketing-textSecondary">
            Over ons
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-marketing-text md:text-4xl">
            Een platform voor betere websites.
          </h1>
          <p className="mt-6 text-lg text-marketing-textSecondary">
            VDB Digital biedt AI-gestuurde website-analyse en groei-inzichten. Wij helpen ondernemers en teams hun website te verbeteren met duidelijke data en actiegerichte adviezen.
          </p>
        </div>

        <div className="mx-auto mt-20 max-w-3xl space-y-10">
          <section className="rounded-2xl border border-marketing-border bg-white p-8 shadow-marketing-card">
            <h2 className="text-xl font-semibold text-marketing-text">Onze aanpak</h2>
            <p className="mt-4 text-lg leading-relaxed text-marketing-textSecondary">
              Wij zien uw website als cruciale infrastructuur voor uw bedrijf. Onze scans zijn gebaseerd op feitelijke data—SEO, prestaties, gebruikerservaring en conversie—zodat u weet waar u staat en wat u als eerste kunt verbeteren. Geen jargon, wel concrete verbeterpunten.
            </p>
          </section>

          <section className="rounded-2xl border border-marketing-border bg-white p-8 shadow-marketing-card">
            <h2 className="text-xl font-semibold text-marketing-text">Wat wij bieden</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-lg text-marketing-textSecondary">
              <li>Gratis website-scan met duidelijke scores</li>
              <li>AI Marketing Toolkit: zoekwoorden, conversie-analyse, content</li>
              <li>Rapporten met technische data en betrouwbaarheidsindicator</li>
              <li>Prijzen voor elk budget: van Gratis tot Agency</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-marketing-border bg-white p-8 shadow-marketing-card">
            <h2 className="text-xl font-semibold text-marketing-text">Contact</h2>
            <p className="mt-4 text-lg text-marketing-textSecondary">
              Heeft u vragen? Neem gerust contact met ons op.
            </p>
            <p className="mt-4">
              <a
                href={COMPANY_EMAIL_MAILTO}
                className="text-lg font-medium text-gold hover:text-goldHover transition-colors"
              >
                {COMPANY_EMAIL}
              </a>
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-medium text-gold hover:text-goldHover transition-colors"
              >
                VDB Digital op LinkedIn →
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-medium text-gold hover:text-goldHover transition-colors"
              >
                VDB Digital op Instagram →
              </a>
            </div>
          </section>
        </div>

        <div className="mt-14 flex flex-wrap justify-center gap-4">
          <Link
            href="/website-scan"
            className="rounded-xl bg-gold px-8 py-4 text-lg font-semibold text-black transition-colors hover:bg-goldHover"
          >
            Start gratis analyse
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-marketing-border bg-white px-8 py-4 text-lg font-semibold text-marketing-text shadow-marketing-card transition-colors hover:border-gold/30 hover:shadow-marketing-card-hover"
          >
            Contact
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
