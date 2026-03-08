import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getProgrammaticSlugs,
  getProgrammaticPage,
  programmaticPages,
} from "@/lib/programmatic-seo";
import ToolLayout from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui";
import { siteUrl } from "@/lib/metadata";

export const dynamic = "force-static";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return getProgrammaticSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getProgrammaticPage(slug);
  if (!page) return { title: "Tool | VDB Digital" };
  const canonical = `${siteUrl}/tools/${slug}`;
  return {
    title: `${page.title} | VDB Digital`,
    description: page.description,
    alternates: { canonical },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    },
  };
}

export default async function ProgrammaticToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getProgrammaticPage(slug);
  if (!page) notFound();

  return (
    <ToolLayout title={page.title} description={page.description}>
      <div className="space-y-10">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-saas-card md:p-8">
          <h2 className="text-xl font-semibold text-slate-900">Voordelen</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-600">
            {page.benefits.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-saas-card md:p-8">
          <h2 className="text-xl font-semibold text-slate-900">Hoe het werkt</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-600">
            {page.howItWorks.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-slate-900">Start de analyse</h2>
          <p className="mt-2 text-sm text-slate-600">
            Vul uw website-URL in en ontvang binnen een minuut een rapport met scores en verbeterpunten.
          </p>
          <Link href="/website-scan" className="mt-4 inline-block">
            <Button size="lg">Start gratis website-analyse</Button>
          </Link>
        </section>

        <nav
          className="rounded-2xl border border-gray-200 bg-white p-6"
          aria-label="Gerelateerde tools"
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Meer tools en analyses
          </h2>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {programmaticPages
              .filter((p) => p.slug !== slug)
              .slice(0, 6)
              .map((p) => (
                <li key={p.slug}>
                  <Link href={`/tools/${p.slug}`} className="text-indigo-600 hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            <li>
              <Link href="/tools/website-audit" className="text-indigo-600 hover:underline">
                Website-audit
              </Link>
            </li>
            <li>
              <Link href="/website-scan" className="text-indigo-600 hover:underline">
                Website scan
              </Link>
            </li>
            <li>
              <Link href="/prijzen" className="text-indigo-600 hover:underline">
                Prijzen
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </ToolLayout>
  );
}
