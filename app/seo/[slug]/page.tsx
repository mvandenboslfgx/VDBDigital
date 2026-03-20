import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import {
  getAllSeoSlugs,
  getSeoPageConfig,
  SITE_URL,
} from "@/lib/seo-pages";
import { pageMetadata } from "@/lib/metadata";
import { SeoPageStructuredData } from "@/components/seo/SeoPageStructuredData";
import { BreadcrumbStructuredData } from "@/components/StructuredData";

export const dynamic = "force-static";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return getAllSeoSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = getSeoPageConfig(slug);
  if (!config) return { title: "SEO | VDB Digital" };
  return pageMetadata({
    title: config.title,
    description: config.description,
    path: `/seo/${slug}`,
  });
}

export default async function SeoSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = getSeoPageConfig(slug);
  if (!config) notFound();

  return (
    <SiteShell>
      <article className="section-container py-16 md:py-24">
        <SeoPageStructuredData slug={slug} config={config} />
        <BreadcrumbStructuredData items={[{ name: "Home", url: "/" }, { name: config.title, url: `/seo/${slug}` }]} />

        <header className="mx-auto max-w-3xl">
          <p className="section-heading">SEO &amp; website</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-marketing-text md:text-4xl lg:text-5xl">
            {config.title}
          </h1>
          <p className="mt-4 text-lg text-marketing-textSecondary">
            {config.description}
          </p>
        </header>

        <div className="mx-auto mt-12 max-w-3xl space-y-10">
          {/* Short explanation */}
          <section
            className="rounded-2xl border border-slate-200 bg-surface p-6 shadow-sm md:p-8"
            aria-labelledby="uitleg-heading"
          >
            <h2 id="uitleg-heading" className="text-xl font-semibold text-marketing-text">
              Uitleg
            </h2>
            <p className="mt-4 leading-relaxed text-marketing-textSecondary">
              {config.intro}
            </p>
          </section>

          {/* Benefits */}
          <section
            className="rounded-2xl border border-slate-200 bg-surface p-6 shadow-sm md:p-8"
            aria-labelledby="voordelen-heading"
          >
            <h2 id="voordelen-heading" className="text-xl font-semibold text-marketing-text">
              Voordelen
            </h2>
            <ul className="mt-4 space-y-2">
              {config.benefits.map((benefit, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-marketing-textSecondary"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" aria-hidden />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Example analysis */}
          <section
            className="rounded-2xl border border-slate-200 bg-surface p-6 shadow-sm md:p-8"
            aria-labelledby="voorbeeld-heading"
          >
            <h2 id="voorbeeld-heading" className="text-xl font-semibold text-marketing-text">
              Voorbeeldanalyse
            </h2>
            <p className="mt-4 leading-relaxed text-marketing-textSecondary">
              {config.exampleAnalysis}
            </p>
          </section>

          {/* CTA – link to /website-scan */}
          <section
            className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-6 md:p-8"
            aria-labelledby="cta-heading"
          >
            <h2 id="cta-heading" className="text-lg font-semibold text-marketing-text">
              Direct aan de slag
            </h2>
            <p className="mt-2 text-marketing-textSecondary">
              Start een gratis analyse en ontvang binnen circa 60 seconden inzicht in je website.
            </p>
            <Link
              href="/website-scan"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Start gratis analyse
            </Link>
          </section>

          {/* Internal links – required: /tools, /website-scan, /kennisbank */}
          <nav
            className="rounded-2xl border border-slate-200 bg-surface p-6"
            aria-label="Gerelateerde pagina’s"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-marketing-textSecondary">
              Meer ontdekken
            </h2>
            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <Link href="/website-scan" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                  Website scan
                </Link>
              </li>
              <li>
                <Link href="/website-seo-check" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                  Website SEO check
                </Link>
              </li>
              <li>
                <Link href="/website-snelheid-test" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                  Website snelheid test
                </Link>
              </li>
              <li>
                <Link href="/conversie-check" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                  Conversie check
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                  Alle tools
                </Link>
              </li>
              <li>
                <Link href="/kennisbank" className="text-indigo-600 hover:text-indigo-700 hover:underline">
                  Kennisbank
                </Link>
              </li>
              {config.relatedLinks?.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-indigo-600 hover:text-indigo-700 hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* FAQ – visible for users and in schema */}
          {config.faqs.length > 0 && (
            <section
              className="rounded-2xl border border-slate-200 bg-surface p-6 md:p-8"
              aria-labelledby="faq-heading"
            >
              <h2 id="faq-heading" className="text-xl font-semibold text-marketing-text">
                Veelgestelde vragen
              </h2>
              <dl className="mt-6 space-y-6">
                {config.faqs.map((faq, i) => (
                  <div key={i}>
                    <dt className="font-medium text-marketing-text">{faq.question}</dt>
                    <dd className="mt-2 text-marketing-textSecondary">{faq.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </article>
    </SiteShell>
  );
}
