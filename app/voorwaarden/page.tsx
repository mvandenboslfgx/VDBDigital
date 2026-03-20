import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";

export const dynamic = "force-static";

export const metadata = pageMetadata({
  title: "Algemene Voorwaarden",
  description: "Algemene voorwaarden van VDB Digital voor het gebruik van website, platform en diensten.",
  path: "/voorwaarden",
});

export default function VoorwaardenPage() {
  return (
    <SiteShell>
      <article className="section-container py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-marketing-text md:text-4xl">
            Algemene Voorwaarden – VDB Digital
          </h1>
          <p className="mt-2 text-marketing-textSecondary">
            Laatst bijgewerkt: 8 maart 2026
          </p>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">1. Toepasselijkheid</h2>
            <p className="mt-3 text-lg leading-relaxed text-marketing-textSecondary">
              Deze voorwaarden zijn van toepassing op alle diensten en producten van VDB Digital.
            </p>
            <p className="mt-3 text-lg leading-relaxed text-marketing-textSecondary">
              Door gebruik te maken van de website of het platform gaat u akkoord met deze voorwaarden.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">2. Diensten</h2>
            <p className="mt-3 text-marketing-textSecondary">VDB Digital biedt:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-marketing-textSecondary">
              <li>AI website analyse tools</li>
              <li>digitale tools en calculators</li>
              <li>kennisartikelen</li>
              <li>hardwareproducten via een webshop</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">3. Accounts</h2>
            <p className="mt-3 text-marketing-textSecondary">
              Voor bepaalde functies moet een gebruiker een account aanmaken.
            </p>
            <p className="mt-3 text-marketing-textSecondary">Gebruikers zijn verantwoordelijk voor:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-marketing-textSecondary">
              <li>hun accountgegevens</li>
              <li>het beveiligen van hun wachtwoord</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">4. Betalingen</h2>
            <p className="mt-3 text-marketing-textSecondary">
              Betalingen voor abonnementen en producten worden verwerkt via Stripe. Wij slaan geen creditcardgegevens op. Alle prijzen zijn inclusief btw tenzij anders vermeld. Facturatie voor abonnementen is maandelijks; het bedrag wordt automatisch afgeschreven.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">5. Abonnementen, opzegging en wat blijft er over</h2>
            <p className="mt-3 text-marketing-textSecondary">
              Abonnementen (Starter, Growth, Agency) lopen maandelijks en worden automatisch verlengd tenzij u opzegt. U kunt elk moment opzeggen via het dashboard (Facturatie → beheer abonnement) of via het Stripe-klantenportaal. Na opzegging wordt er geen nieuw bedrag meer afgeschreven.
            </p>
            <p className="mt-3 text-marketing-textSecondary">
              <strong>Wat blijft er over na opzegging?</strong> U gaat terug naar het gratis plan. U behoudt toegang tot uw account. Uw eerder gegenereerde rapporten blijven zichtbaar. U krijgt weer 1 gratis website-scan per maand. Er is geen restitutie voor de reeds betaalde maand; u kunt de dienst tot het einde van de betaalperiode blijven gebruiken.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">5b. Herroepingsrecht en restitutie</h2>
            <p className="mt-3 text-marketing-textSecondary">
              Voor abonnementen op digitale content (zoals onze scans en AI-tools) gaat u bij aankoop akkoord met directe levering; het herroepingsrecht vervalt daarmee voor zover de wet dat toestaat. Bij fysieke producten (webshop) heeft u 14 dagen herroepingsrecht. Restitutie voor reeds verbruikte abonnementsmaanden wordt niet verleend.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">6. Hardware verkoop</h2>
            <p className="mt-3 text-marketing-textSecondary">
              Voor fysieke producten gelden de volgende regels:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-marketing-textSecondary">
              <li>levering afhankelijk van voorraad</li>
              <li>retour volgens wettelijke termijn</li>
              <li>garantie volgens Europese consumentenwetgeving</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">7. Aansprakelijkheid</h2>
            <p className="mt-3 text-marketing-textSecondary">
              VDB Digital is niet aansprakelijk voor:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-marketing-textSecondary">
              <li>indirecte schade</li>
              <li>verlies van data</li>
              <li>beslissingen gebaseerd op analyses</li>
            </ul>
            <p className="mt-3 text-marketing-textSecondary">
              Gebruik van de tools is op eigen risico.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">8. Intellectueel eigendom</h2>
            <p className="mt-3 text-marketing-textSecondary">
              Alle software, content en technologie op het platform blijven eigendom van VDB Digital.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">9. Misbruik</h2>
            <p className="mt-3 text-marketing-textSecondary">
              Het is verboden om het platform te gebruiken voor:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-marketing-textSecondary">
              <li>illegale activiteiten</li>
              <li>hacking of misbruik</li>
              <li>spam of schadelijke software</li>
            </ul>
            <p className="mt-3 text-marketing-textSecondary">
              Accounts kunnen worden geblokkeerd bij misbruik.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">10. Wijzigingen</h2>
            <p className="mt-3 text-marketing-textSecondary">
              VDB Digital kan deze voorwaarden wijzigen.
            </p>
          </section>

          <nav className="mt-14 flex flex-wrap gap-4 text-sm">
            <Link href="/privacy" className="text-indigo-600 hover:text-indigo-700 underline">Privacybeleid</Link>
            <Link href="/cookies" className="text-indigo-600 hover:text-indigo-700 underline">Cookiebeleid</Link>
            <Link href="/disclaimer" className="text-indigo-600 hover:text-indigo-700 underline">Disclaimer</Link>
            <Link href="/prijzen" className="text-indigo-600 hover:text-indigo-700 underline">Prijzen</Link>
            <Link href="/contact" className="text-indigo-600 hover:text-indigo-700 underline">Contact</Link>
          </nav>
        </div>
      </article>
    </SiteShell>
  );
}
