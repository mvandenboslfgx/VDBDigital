import SiteShell from "@/components/SiteShell";
import Link from "next/link";
import { pageMetadata } from "@/lib/metadata";
import { COMPANY_EMAIL, COMPANY_EMAIL_MAILTO } from "@/lib/company";

export const dynamic = "force-static";

export const metadata = pageMetadata({
  title: "Privacybeleid",
  description: "Privacybeleid van VDB Digital. Welke persoonsgegevens wij verzamelen en hoe wij deze gebruiken.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <SiteShell>
      <article className="section-container py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-marketing-text md:text-4xl">
            Privacybeleid – VDB Digital
          </h1>
          <p className="mt-2 text-marketing-textSecondary">
            Laatst bijgewerkt: 8 maart 2026
          </p>
          <p className="mt-6 text-lg leading-relaxed text-marketing-textSecondary">
            VDB Digital respecteert de privacy van alle gebruikers van haar website en platform. In dit privacybeleid leggen wij uit welke persoonsgegevens wij verzamelen, hoe wij deze gebruiken en welke rechten u heeft.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-marketing-textSecondary">
            Door gebruik te maken van onze website en diensten gaat u akkoord met dit privacybeleid.
          </p>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">1. Bedrijfsgegevens</h2>
            <p className="mt-3 text-marketing-textSecondary">
              VDB Digital<br />
              Website: <a href="https://www.vdbdigital.nl" className="text-gold hover:text-goldHover underline">https://www.vdbdigital.nl</a><br />
              E-mail: <a href={COMPANY_EMAIL_MAILTO} className="text-gold hover:text-goldHover underline">{COMPANY_EMAIL}</a>
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">2. Persoonsgegevens die wij verzamelen</h2>
            <p className="mt-3 text-marketing-textSecondary">Wij kunnen de volgende gegevens verzamelen:</p>
            <h3 className="mt-4 font-medium text-marketing-text">Accountgegevens</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-marketing-textSecondary">
              <li>naam</li>
              <li>e-mailadres</li>
              <li>wachtwoord (versleuteld opgeslagen)</li>
            </ul>
            <h3 className="mt-4 font-medium text-marketing-text">Gebruiksgegevens</h3>
            <ul className="mt-2 list-inside list-disc space-y-1 text-marketing-textSecondary">
              <li>IP-adres</li>
              <li>browser en apparaat informatie</li>
              <li>bezochte pagina&apos;s</li>
              <li>gebruik van tools en analyses</li>
            </ul>
            <h3 className="mt-4 font-medium text-marketing-text">Aanbevolen partners (advertenties)</h3>
            <p className="mt-2 text-marketing-textSecondary">
              Voor het tonen van relevante partneraanbevelingen kunnen wij een technische, gehashte fingerprint
              gebruiken (o.a. op basis van een sessie-cookie, verkorte IP en browserkenmerken), periodiek gecombineerd
              met een roterende sleutel. Dit dient fraude- en frequentielimieten; wij volgen geen individuele
              surfprofielen over langere tijd buiten deze doeleinden.
            </p>
            <h3 className="mt-4 font-medium text-marketing-text">Website-analyse gegevens</h3>
            <p className="mt-2 text-marketing-textSecondary">Wanneer u een website analyse uitvoert:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-marketing-textSecondary">
              <li>ingevoerde website-URL</li>
              <li>gegenereerde analysegegevens</li>
              <li>rapportresultaten</li>
            </ul>
            <h3 className="mt-4 font-medium text-marketing-text">Bestelgegevens (webshop)</h3>
            <p className="mt-2 text-marketing-textSecondary">Wanneer u een product koopt:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-marketing-textSecondary">
              <li>naam</li>
              <li>adres</li>
              <li>e-mail</li>
              <li>betaalinformatie</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">3. Doel van gegevensverwerking</h2>
            <p className="mt-3 text-marketing-textSecondary">Wij gebruiken gegevens voor:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-marketing-textSecondary">
              <li>het leveren van onze diensten</li>
              <li>het uitvoeren van website analyses</li>
              <li>het genereren van rapporten</li>
              <li>het verwerken van bestellingen</li>
              <li>klantenservice</li>
              <li>verbetering van ons platform</li>
              <li>beveiliging en fraudepreventie</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">4. Betalingen</h2>
            <p className="mt-3 text-marketing-textSecondary">
              Betalingen worden verwerkt via Stripe (o.a. iDEAL, creditcard). VDB Digital slaat geen volledige betaalgegevens op; Stripe verwerkt deze conform hun privacybeleid.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">5. Cookies</h2>
            <p className="mt-3 text-marketing-textSecondary">
              Onze website gebruikt cookies voor:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-marketing-textSecondary">
              <li>login en sessies</li>
              <li>statistieken</li>
              <li>verbetering van gebruikerservaring</li>
            </ul>
            <p className="mt-3 text-marketing-textSecondary">
              Meer informatie vindt u in ons <Link href="/cookies" className="text-indigo-600 hover:text-indigo-700 underline">cookiebeleid</Link>.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">6. Delen van gegevens</h2>
            <p className="mt-3 text-marketing-textSecondary">
              Wij verkopen nooit persoonsgegevens.
            </p>
            <p className="mt-3 text-marketing-textSecondary">
              Gegevens kunnen worden gedeeld met:
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-marketing-textSecondary">
              <li>hostingproviders</li>
              <li>betalingsproviders</li>
              <li>analyse diensten</li>
              <li>beveiligingsdiensten</li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">7. Beveiliging</h2>
            <p className="mt-3 text-marketing-textSecondary">
              Wij nemen passende technische en organisatorische maatregelen om persoonsgegevens te beschermen.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">8. Bewaartermijn</h2>
            <p className="mt-3 text-marketing-textSecondary">
              Gegevens worden niet langer bewaard dan noodzakelijk voor de dienstverlening en wettelijke verplichtingen. Na opzegging van een abonnement blijven uw accountgegevens en rapporten bewaard zolang u inlogt; u gaat over naar het gratis plan. Als u uw account wilt laten verwijderen, kunt u dat via de instellingen of door contact met ons op te nemen; daarna worden uw persoonsgegevens binnen redelijke termijn verwijderd, behalve waar wij wettelijk verplicht zijn gegevens te bewaren.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">9. Uw rechten</h2>
            <p className="mt-3 text-marketing-textSecondary">U heeft het recht om:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-marketing-textSecondary">
              <li>uw gegevens in te zien</li>
              <li>gegevens te corrigeren</li>
              <li>gegevens te laten verwijderen (waaronder accountverwijdering)</li>
              <li>bezwaar te maken tegen verwerking</li>
            </ul>
            <p className="mt-3 text-marketing-textSecondary">
              Neem contact met ons op via de contactpagina of per e-mail om een verzoek in te dienen.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold text-marketing-text">10. Wijzigingen</h2>
            <p className="mt-3 text-marketing-textSecondary">
              Wij kunnen dit privacybeleid aanpassen. De meest recente versie staat altijd op deze pagina.
            </p>
          </section>

          <nav className="mt-14 flex flex-wrap gap-4 text-sm">
            <Link href="/voorwaarden" className="text-indigo-600 hover:text-indigo-700 underline">Algemene voorwaarden</Link>
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
