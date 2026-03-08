import SiteShell from "@/components/SiteShell";
import PageTransition from "@/components/PageTransition";
import PageHero from "@/components/PageHero";
import { pageMetadata } from "@/lib/metadata";
import { COMPANY_EMAIL, COMPANY_EMAIL_MAILTO, LINKEDIN_URL, INSTAGRAM_URL } from "@/lib/company";

export const metadata = pageMetadata({
  title: "Over ons",
  description:
    "VDB Digital is een studio voor beslissende merken. We zien je website als cruciale infrastructuur en bouwen systemen die kansen verhogen.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <SiteShell>
      <PageTransition>
        <PageHero
          eyebrow="OVER"
          title="Een studio voor beslissende merken."
          subtitle="VDB Digital bestaat voor teams die hun website zien als cruciale infrastructuur, niet als decoratie. We ontwerpen systemen die stilletjes de kwaliteit en hoeveelheid kansen verhogen die bij je binnenkomen."
        />
        <section className="pb-28">
          <div className="section-container grid gap-10 lg:grid-cols-[1.3fr,1fr] items-start">
            <div className="space-y-6 text-sm sm:text-base text-gray-300/90">
              <h2 className="text-sm font-semibold tracking-[0.2em] text-gray-400 uppercase">
                Perspectief
              </h2>
              <p>
                We behandelen elk traject als een infrastructuurproject: iets
                dat merkbaar moet versterken hoe jouw bedrijf de juiste klanten
                aantrekt, informeert en converteert. Design, copy en techniek
                worden samen aangepakt, nooit los van elkaar.
              </p>
              <p>
                Ons werk is bewust minimalistisch. We verkiezen helderheid boven
                ruis, diepte boven decoratie en kalme interfaces boven slimme
                trucjes. Achter die kalmte zit rigoureuze aandacht voor
                detail—flows uitgewerkt, states doordacht, scenario&apos;s
                voorzien.
              </p>
              <p>
                VDB Digital werkt tegelijkertijd met een klein aantal klanten.
                Zo blijft er senior aandacht op het werk en krijgt elk project
                de ruimte om echt effectief te worden.
              </p>
            </div>
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#181818] via-black to-black/95 p-6 shadow-[0_26px_70px_rgba(0,0,0,0.95)]">
                <h3 className="text-sm font-semibold text-white">
                  Principes waar we niet op inleveren
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-gray-300/90">
                  <li>• Elke pagina heeft een duidelijke taak en primaire actie.</li>
                  <li>
                    • De ervaring moet kalm blijven, zelfs bij zwaar gebruik.
                  </li>
                  <li>
                    • Esthetiek ondersteunt performance, nooit andersom.
                  </li>
                </ul>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/80 p-6 shadow-[0_20px_55px_rgba(0,0,0,0.9)] text-sm text-gray-200">
                <h3 className="text-sm font-semibold text-white">
                  Met wie we het beste werken
                </h3>
                <p className="mt-3 text-gray-300/90">
                  Leidinggevende teams die helder zijn over hun positionering,
                  serieus naar marges kijken en bereid zijn om in digitaal te
                  investeren als kernasset—niet als snelle pleister.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/80 p-6 shadow-[0_20px_55px_rgba(0,0,0,0.9)] text-sm text-gray-200">
                <h3 className="text-sm font-semibold text-white">
                  Contact
                </h3>
                <p className="mt-3 text-gray-300/90">
                  E-mail:{" "}
                  <a href={COMPANY_EMAIL_MAILTO} className="text-gold hover:underline">
                    {COMPANY_EMAIL}
                  </a>
                </p>
                <p className="mt-2">
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:underline"
                  >
                    VDB Digital op LinkedIn →
                  </a>
                </p>
                <p className="mt-2">
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:underline"
                  >
                    VDB Digital op Instagram →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </PageTransition>
    </SiteShell>
  );
}

