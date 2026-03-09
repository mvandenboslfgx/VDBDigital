import dynamic from "next/dynamic";
import SiteShell from "@/components/SiteShell";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Gratis Website Analyse met AI",
  description: "Laat onze AI je website analyseren op SEO, snelheid en conversie. Ontvang direct concrete verbeterpunten en verhoog je online resultaat.",
  path: "/website-scan",
});

const WebsiteScanSection = dynamic(
  () => import("@/components/home/WebsiteScanSection").then((m) => ({ default: m.default })),
  { ssr: true }
);

export default async function WebsiteScanPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url: urlParam } = await searchParams;
  const initialUrl = typeof urlParam === "string" ? urlParam.trim() : "";

  return (
    <SiteShell>
      <div className="section-container py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
            Controleer direct de prestaties van uw website
          </h1>
          <p className="text-slate-600 mt-4 text-lg">
            Laat onze AI uw website analyseren op SEO, snelheid en conversie. Ontvang direct concrete verbeterpunten.
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-slate-600">
            <li className="flex items-center gap-2">
              <span className="text-blue-600 font-medium">✓</span> SEO analyse
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-600 font-medium">✓</span> Snelheid analyse
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-600 font-medium">✓</span> UX analyse
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-600 font-medium">✓</span> Conversie optimalisatie
            </li>
          </ul>
        </div>
        <div id="scan-form" className="mt-12">
          <WebsiteScanSection initialUrl={initialUrl} />
        </div>
      </div>
    </SiteShell>
  );
}
