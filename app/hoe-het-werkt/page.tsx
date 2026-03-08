import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { pageMetadata } from "@/lib/metadata";
import { Button } from "@/components/ui";

export const metadata = pageMetadata({
  title: "Hoe het werkt",
  description: "In drie stappen naar een duidelijke website-analyse: voer je website in, AI analyseert, ontvang verbeterpunten.",
  path: "/hoe-het-werkt",
});

const steps = [
  {
    num: 1,
    title: "Voer je website in",
    desc: "Geef het adres van je website. Wij halen de pagina op en analyseren deze veilig. Alleen de openbaar toegankelijke HTML en prestatiedata worden gebruikt.",
  },
  {
    num: 2,
    title: "Onze AI analyseert je website",
    desc: "SEO, prestaties, gebruikerservaring en conversie worden gemeten. De scores zijn gebaseerd op feitelijke data; AI wordt alleen ingezet voor duidelijke uitleg en aanbevelingen.",
  },
  {
    num: 3,
    title: "Ontvang duidelijke verbeterpunten",
    desc: "U ontvangt scores per categorie, technische data (H1, afbeeldingen, links, viewport) en een betrouwbaarheidsindicator. Verbeterpunten zijn prioriteerd en direct toepasbaar.",
  },
];

export default function HoeHetWerktPage() {
  return (
    <SiteShell>
      <div className="section-container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-heading">Hoe het werkt</p>
          <h1 className="section-title mt-2">In drie stappen naar inzicht.</h1>
          <p className="text-sub mt-4">
            Geen ingewikkelde setup. Geen weken wachten. Binnen enkele seconden een helder rapport.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-4xl space-y-12">
          {steps.map((step) => (
            <div
              key={step.num}
              className="flex flex-col gap-6 rounded-2xl border border-white/[0.06] bg-[#111113]/80 p-8 md:flex-row md:items-start"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-lg font-semibold text-amber-400">
                {step.num}
              </span>
              <div>
                <h2 className="text-xl font-semibold text-white">{step.title}</h2>
                <p className="mt-2 text-zinc-400">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 flex flex-wrap justify-center gap-4">
          <Link href="/website-scan">
            <Button size="lg" className="min-h-[48px]">
              Website analyseren
            </Button>
          </Link>
          <Link href="/prijzen">
            <Button variant="ghost" size="lg" className="min-h-[48px]">
              Bekijk prijzen
            </Button>
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
