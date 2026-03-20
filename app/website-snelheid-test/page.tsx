import Link from "next/link";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import { pageMetadata } from "@/lib/metadata";
import { FAQStructuredData } from "@/components/StructuredData";

export const metadata: Metadata = pageMetadata({
  title: "Website Snelheid Test – Gratis Laadsnelheid Check",
  description:
    "Test de snelheid van je website gratis. Meet Core Web Vitals (LCP, INP, CLS) en ontvang direct tips om je site te versnellen voor betere UX en SEO.",
  path: "/website-snelheid-test",
});

const faqs = [
  {
    question: "Wat meet een website snelheid test?",
    answer:
      "Onze test meet onder meer Core Web Vitals: LCP (hoe snel de hoofdcontent laadt), INP/FID (respons op interactie) en CLS (visuele stabiliteit). Daarnaast krijg je inzicht in laadtijd en aanbevelingen om je site te versnellen.",
  },
  {
    question: "Waarom is website snelheid belangrijk?",
    answer:
      "Een snelle site verbetert de gebruikerservaring, verlaagt het bouncepercentage en wordt door Google beter gewaardeerd voor zoekresultaten. Core Web Vitals zijn onderdeel van het ranking-algoritme.",
  },
];

export default function WebsiteSnelheidTestPage() {
  return (
    <SiteShell>
      <article className="section-container py-16 md:py-24">
        <FAQStructuredData faqs={faqs} />
        <header className="mx-auto max-w-3xl text-center">
          <p className="section-heading">Performance</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
            Website snelheid test – meet en verbeter je laadtijd
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Ontdek hoe snel je website laadt en wat je kunt verbeteren. Onze tool meet Core Web Vitals en geeft concrete tips voor een snellere site en betere rankings.
          </p>
        </header>

        <div className="mx-auto mt-12 max-w-3xl space-y-10">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8" aria-labelledby="wat-heading">
            <h2 id="wat-heading" className="text-xl font-semibold text-slate-900">
              Wat zijn Core Web Vitals?
            </h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              Core Web Vitals zijn door Google gedefinieerde metrics: <strong>LCP</strong> (laadsnelheid van de hoofdcontent), 
              <strong> INP/FID</strong> (responsiviteit op klikken) en <strong>CLS</strong> (visuele stabiliteit). Ze beïnvloeden gebruikerservaring en SEO. 
              Onze snelheidstest toont waar je staat en wat de grootste knelpunten zijn.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8" aria-labelledby="voordelen-heading">
            <h2 id="voordelen-heading" className="text-xl font-semibold text-slate-900">
              Voordelen van een snelheidstest
            </h2>
            <ul className="mt-4 space-y-2 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" aria-hidden />
                Meting van Core Web Vitals (LCP, INP, CLS)
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" aria-hidden />
                Praktische tips om je site te versnellen
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" aria-hidden />
                Betere gebruikerservaring en lagere bounce
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" aria-hidden />
                Positief effect op zoekmachine rankings
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/30 p-6 md:p-8" aria-labelledby="cta-heading">
            <h2 id="cta-heading" className="text-lg font-semibold text-slate-900">
              Start je gratis website snelheid test
            </h2>
            <p className="mt-2 text-slate-600">
              Voer je URL in bij de website-scan; performance wordt automatisch gemeten. Je ziet scores en aanbevelingen voor snelheid.
            </p>
            <Link
              href="/website-scan"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Start gratis snelheidstest
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
                <Link href="/conversie-check" className="text-indigo-600 hover:text-indigo-700 hover:underline">Conversie check</Link>
              </li>
              <li>
                <Link href="/tools" className="text-indigo-600 hover:text-indigo-700 hover:underline">Alle tools</Link>
              </li>
              <li>
                <Link href="/kennisbank/website-snelheid" className="text-indigo-600 hover:text-indigo-700 hover:underline">Website snelheid in de kennisbank</Link>
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
