import Link from "next/link";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import { pageMetadata } from "@/lib/metadata";
import { FAQStructuredData } from "@/components/StructuredData";

export const metadata: Metadata = pageMetadata({
  title: "Website SEO Check – Gratis SEO Controle",
  description:
    "Voer een gratis website SEO check uit. Controleer titels, meta, koppen en technische SEO. Ontvang direct verbeterpunten voor betere vindbaarheid in Google.",
  path: "/website-seo-check",
});

const faqs = [
  {
    question: "Wat is een website SEO check?",
    answer:
      "Een website SEO check is een controle van de zoekmachine-optimalisatie van je site: titels, meta descriptions, koppenstructuur (H1, H2), afbeeldingen en technische aspecten. Onze tool geeft een score en concrete verbeterpunten.",
  },
  {
    question: "Is de SEO check gratis?",
    answer:
      "Ja. Via onze website-scan voer je gratis een SEO-check uit. Je ontvangt een score en verbeterpunten. Voor herhaalde of uitgebreidere analyses zijn er betaalde opties.",
  },
];

export default function WebsiteSeoCheckPage() {
  return (
    <SiteShell>
      <article className="section-container py-16 md:py-24">
        <FAQStructuredData faqs={faqs} />
        <header className="mx-auto max-w-3xl text-center">
          <p className="section-heading">SEO</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
            Website SEO check – gratis controle van je vindbaarheid
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Controleer in één minuut hoe je website scoort op zoekmachine-optimalisatie. Ontvang een duidelijke score en concrete verbeterpunten voor betere rankings in Google.
          </p>
        </header>

        <div className="mx-auto mt-12 max-w-3xl space-y-10">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8" aria-labelledby="wat-heading">
            <h2 id="wat-heading" className="text-xl font-semibold text-slate-900">
              Wat wordt er gecontroleerd?
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Onze SEO check beoordeelt onder meer je <strong>meta title en description</strong>, het gebruik van <strong>koppen (H1, H2, H3)</strong>, 
              alt-teksten bij afbeeldingen, canonicals en gestructureerde data. Je krijgt een score per onderdeel en actiepunten om hoger in Google te ranken.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8" aria-labelledby="voordelen-heading">
            <h2 id="voordelen-heading" className="text-xl font-semibold text-slate-900">
              Voordelen van een gratis SEO check
            </h2>
            <ul className="mt-4 space-y-2 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" aria-hidden />
                Controle van titel, meta description en koppenstructuur
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" aria-hidden />
                Inzicht in technische SEO (canonicals, structured data)
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" aria-hidden />
                Aanbevelingen voor betere vindbaarheid
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" aria-hidden />
                Snel resultaat, geen installatie nodig
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/30 p-6 md:p-8" aria-labelledby="cta-heading">
            <h2 id="cta-heading" className="text-lg font-semibold text-slate-900">
              Start je gratis website SEO check
            </h2>
            <p className="mt-2 text-slate-600">
              Voer je website-URL in en ontvang binnen circa 60 seconden een SEO-score en verbeterpunten.
            </p>
            <Link
              href="/website-scan"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Start gratis SEO check
            </Link>
          </section>

          <nav className="rounded-2xl border border-slate-200 bg-white p-6" aria-label="Gerelateerde pagina's">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Meer ontdekken</h2>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <Link href="/website-scan" className="text-indigo-600 hover:text-indigo-700 hover:underline">Website scan</Link>
              </li>
              <li>
                <Link href="/website-snelheid-test" className="text-indigo-600 hover:text-indigo-700 hover:underline">Website snelheid test</Link>
              </li>
              <li>
                <Link href="/conversie-check" className="text-indigo-600 hover:text-indigo-700 hover:underline">Conversie check</Link>
              </li>
              <li>
                <Link href="/tools" className="text-indigo-600 hover:text-indigo-700 hover:underline">Alle tools</Link>
              </li>
              <li>
                <Link href="/kennisbank" className="text-indigo-600 hover:text-indigo-700 hover:underline">Kennisbank</Link>
              </li>
            </ul>
          </nav>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-xl font-semibold text-slate-900">Veelgestelde vragen</h2>
            <dl className="mt-6 space-y-6">
              {faqs.map((faq, i) => (
                <div key={i}>
                  <dt className="font-medium text-slate-900">{faq.question}</dt>
                  <dd className="mt-2 text-slate-600">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </article>
    </SiteShell>
  );
}
