import Link from "next/link";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import { pageMetadata } from "@/lib/metadata";
import { FAQStructuredData } from "@/components/StructuredData";

export const metadata: Metadata = pageMetadata({
  title: "Conversie Check – Analyseer de Conversie van je Website",
  description:
    "Voer een gratis conversie check uit. Ontdek waarom bezoekers niet converteren. Analyse van CTA's, formulieren en gebruikerservaring met concrete verbeterpunten.",
  path: "/conversie-check",
});

const faqs = [
  {
    question: "Wat is een conversie check?",
    answer:
      "Een conversie check analyseert de elementen op je website die bezoekers moeten verleiden tot een actie: inschrijven, kopen, contact opnemen of een formulier invullen. We kijken naar CTA's, formulieren, vertrouwenselementen en de logische flow van je pagina's.",
  },
  {
    question: "Hoe verbeter ik mijn conversie?",
    answer:
      "Na de check ontvang je een score en concrete verbeterpunten: bijvoorbeeld duidelijkere call-to-actions, eenvoudigere formulieren of betere sociale bewijskracht. Pas de aanbevelingen toe en meet opnieuw met onze website-scan.",
  },
];

export default function ConversieCheckPage() {
  return (
    <SiteShell>
      <article className="section-container py-16 md:py-24">
        <FAQStructuredData faqs={faqs} />
        <header className="mx-auto max-w-3xl text-center">
          <p className="section-heading">Conversie</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
            Conversie check – ontdek waarom bezoekers niet converteren
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Analyseer de conversie-elementen van je website: CTA's, formulieren en gebruikerservaring. Ontvang een score en concrete verbeterpunten om meer bezoekers om te zetten in klanten of leads.
          </p>
        </header>

        <div className="mx-auto mt-12 max-w-3xl space-y-10">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8" aria-labelledby="wat-heading">
            <h2 id="wat-heading" className="text-xl font-semibold text-slate-900">
              Wat wordt er geanalyseerd?
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              De conversie-analyse beoordeelt onder meer de <strong>zichtbaarheid en tekst van je call-to-action</strong>, 
              de eenvoud van <strong>formulieren</strong>, het gebruik van <strong>social proof</strong> en de helderheid van je aanbod. 
              Je krijgt per onderdeel een score en verbeterpunten die je direct kunt toepassen.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8" aria-labelledby="voordelen-heading">
            <h2 id="voordelen-heading" className="text-xl font-semibold text-slate-900">
              Voordelen van een conversie check
            </h2>
            <ul className="mt-4 space-y-2 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" aria-hidden />
                Analyse van CTA's, formulieren en paginastructuur
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" aria-hidden />
                Advies voor meer vertrouwen en duidelijkheid
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" aria-hidden />
                Focus op acties die leiden tot conversie
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" aria-hidden />
                Toepasbare aanbevelingen per pagina
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/30 p-6 md:p-8" aria-labelledby="cta-heading">
            <h2 id="cta-heading" className="text-lg font-semibold text-slate-900">
              Start je gratis conversie check
            </h2>
            <p className="mt-2 text-slate-600">
              Start een website-scan met je URL; de tool beoordeelt conversie-elementen en geeft een conversiescore en verbeterpunten.
            </p>
            <Link
              href="/website-scan"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Start gratis conversie check
            </Link>
          </section>

          <nav className="rounded-2xl border border-slate-200 bg-white p-6" aria-label="Gerelateerde pagina's">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Meer ontdekken</h2>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <Link href="/website-scan" className="text-indigo-600 hover:text-indigo-700 hover:underline">Website scan</Link>
              </li>
              <li>
                <Link href="/website-seo-check" className="text-indigo-600 hover:text-indigo-700 hover:underline">Website SEO check</Link>
              </li>
              <li>
                <Link href="/website-snelheid-test" className="text-indigo-600 hover:text-indigo-700 hover:underline">Website snelheid test</Link>
              </li>
              <li>
                <Link href="/tools" className="text-indigo-600 hover:text-indigo-700 hover:underline">Alle tools</Link>
              </li>
              <li>
                <Link href="/kennisbank/conversie" className="text-indigo-600 hover:text-indigo-700 hover:underline">Conversie in de kennisbank</Link>
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
