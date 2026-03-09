import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-static";

export const metadata = pageMetadata({
  title: "Disclaimer",
  description: "Disclaimer van VDB Digital over het gebruik van analyses en rapporten.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return (
    <SiteShell>
      <article className="section-container py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-marketing-text md:text-4xl">
            Disclaimer – VDB Digital
          </h1>
          <p className="mt-2 text-marketing-textSecondary">
            Laatst bijgewerkt: 8 maart 2026
          </p>

          <div className="mt-10 space-y-6 text-lg leading-relaxed text-marketing-textSecondary">
            <p>
              De analyses en rapporten die door VDB Digital worden gegenereerd zijn bedoeld als informatieve hulpmiddelen.
            </p>
            <p>
              Hoewel wij streven naar nauwkeurige resultaten, geven wij geen garanties over:
            </p>
            <ul className="list-inside list-disc space-y-1 pl-2">
              <li>volledigheid van analyses</li>
              <li>prestaties van websites</li>
              <li>SEO resultaten</li>
            </ul>
            <p>
              Gebruikers blijven zelf verantwoordelijk voor beslissingen die zij nemen op basis van de verstrekte informatie.
            </p>
            <p>
              VDB Digital kan niet aansprakelijk worden gesteld voor directe of indirecte schade die voortvloeit uit het gebruik van het platform.
            </p>
          </div>

          <nav className="mt-14 flex flex-wrap gap-4 text-sm">
            <Link href="/privacy" className="text-gold hover:text-goldHover underline">Privacybeleid</Link>
            <Link href="/voorwaarden" className="text-gold hover:text-goldHover underline">Algemene voorwaarden</Link>
            <Link href="/cookies" className="text-gold hover:text-goldHover underline">Cookiebeleid</Link>
            <Link href="/contact" className="text-gold hover:text-goldHover underline">Contact</Link>
          </nav>
        </div>
      </article>
    </SiteShell>
  );
}
