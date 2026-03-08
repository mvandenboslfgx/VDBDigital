import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";

const PLATFORM_LINKS = [
  { title: "Hoe het werkt", href: "/platform/hoe-het-werkt", description: "Stappen om je website te laten analyseren en rapporten te ontvangen." },
  { title: "Website analyse", href: "/platform/website-analyse", description: "Wat we meten: SEO, performance, UX en conversie." },
  { title: "AI technologie", href: "/platform/ai-technologie", description: "Hoe we AI inzetten voor duidelijke adviezen en inzichten." },
  { title: "Rapport systeem", href: "/platform/rapport-systeem", description: "Scores, verbeterpunten en technische data in één overzicht." },
  { title: "Voor agencies", href: "/platform/agencies", description: "Schaalbaar inzicht voor meerdere klanten en projecten." },
  { title: "Integraties", href: "/platform/integraties", description: "Koppelingen en API voor je eigen workflow." },
];

export const metadata = pageMetadata({
  title: "Platform",
  description: "Ontdek hoe het VDB Digital platform werkt: website-analyse, AI, rapporten en integraties.",
  path: "/platform",
});

export default function PlatformPage() {
  return (
    <SiteShell>
      <div className="section-container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-marketing-text md:text-5xl lg:text-6xl">
            Het platform
          </h1>
          <p className="mt-6 text-lg text-marketing-textSecondary">
            Eén plek voor website-analyse, AI-tools, rapporten en groei. Ontdek hoe alles samenwerkt.
          </p>
        </div>
        <div className="mx-auto mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-gold/30 hover:shadow-md"
            >
              <h2 className="text-xl font-semibold text-marketing-text group-hover:text-gold transition-colors">
                {item.title}
              </h2>
              <p className="mt-3 text-lg text-marketing-textSecondary">
                {item.description}
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-gold">Lees meer →</span>
            </Link>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link
            href="/website-scan"
            className="inline-flex items-center justify-center rounded-xl bg-gold px-8 py-4 text-lg font-semibold text-black transition-colors hover:bg-goldHover"
          >
            Start gratis analyse
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
