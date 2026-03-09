import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-static";

export const metadata = pageMetadata({
  title: "Cookiebeleid",
  description: "Cookiebeleid van VDB Digital. Welke cookies wij gebruiken en hoe u deze kunt beheren.",
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <SiteShell>
      <article className="section-container py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-marketing-text md:text-4xl">
            Cookiebeleid – VDB Digital
          </h1>
          <p className="mt-2 text-marketing-textSecondary">
            Laatst bijgewerkt: 8 maart 2026
          </p>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">1. Wat zijn cookies</h2>
            <p className="mt-3 text-lg leading-relaxed text-marketing-textSecondary">
              Cookies zijn kleine bestanden die door uw browser worden opgeslagen om websites beter te laten functioneren.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">2. Welke cookies wij gebruiken</h2>
            <h3 className="mt-4 font-medium text-marketing-text">Functionele cookies</h3>
            <p className="mt-2 text-marketing-textSecondary">
              Nodig voor basisfunctionaliteit zoals:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-marketing-textSecondary">
              <li>login</li>
              <li>sessiebeheer</li>
            </ul>
            <h3 className="mt-4 font-medium text-marketing-text">Analyse cookies</h3>
            <p className="mt-2 text-marketing-textSecondary">
              Worden gebruikt om inzicht te krijgen in gebruik van de website.
            </p>
            <h3 className="mt-4 font-medium text-marketing-text">Prestatie cookies</h3>
            <p className="mt-2 text-marketing-textSecondary">
              Helpen ons de website te verbeteren.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">3. Cookies beheren</h2>
            <p className="mt-3 text-lg leading-relaxed text-marketing-textSecondary">
              U kunt cookies uitschakelen via uw browserinstellingen.
            </p>
            <p className="mt-3 text-lg leading-relaxed text-marketing-textSecondary">
              Let op: sommige functies van de website kunnen dan minder goed werken.
            </p>
          </section>

          <nav className="mt-14 flex flex-wrap gap-4 text-sm">
            <Link href="/privacy" className="text-gold hover:text-goldHover underline">Privacybeleid</Link>
            <Link href="/voorwaarden" className="text-gold hover:text-goldHover underline">Algemene voorwaarden</Link>
            <Link href="/disclaimer" className="text-gold hover:text-goldHover underline">Disclaimer</Link>
            <Link href="/contact" className="text-gold hover:text-goldHover underline">Contact</Link>
          </nav>
        </div>
      </article>
    </SiteShell>
  );
}
