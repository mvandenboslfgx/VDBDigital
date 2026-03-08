import SiteShell from "@/components/SiteShell";
import PageHero from "@/components/PageHero";
import PageTransition from "@/components/PageTransition";
import { pageMetadata } from "@/lib/metadata";
import { FAQStructuredData } from "@/components/StructuredData";
import Link from "next/link";
import { COMPANY_EMAIL, COMPANY_EMAIL_MAILTO } from "@/lib/company";

export const metadata = pageMetadata({
  title: "Support",
  description:
    "Klantensupport van VDB Digital: e-mail, live chat, remote hulp via TeamViewer en geplande consultatie. Duidelijke instructies voor elke methode.",
  path: "/support",
});

const supportMethods = [
  {
    title: "E-mailondersteuning",
    description:
      "Stel je vraag per e-mail. We reageren doorgaans binnen één werkdag op werkdagen.",
    instructions: [
      `Stuur een e-mail naar ${COMPANY_EMAIL} (algemene vragen) of naar het adres dat je bij je project of in de clientportaal-communicatie hebt gekregen.`,
      "Vermeld je projectnaam of e-mailadres waarmee je geregistreerd bent.",
      "Beschrijf je vraag of probleem zo concreet mogelijk.",
    ],
    emailDisplay: true,
    cta: "Ga naar contact voor algemene vragen",
    href: "/contact",
  },
  {
    title: "Live chat",
    emailDisplay: false,
    description:
      "Tijdens kantooruren kun je via de website een chat starten voor korte vragen.",
    instructions: [
      "Klik rechtsonder op het chat-icoon (indien beschikbaar op de pagina).",
      "Type je vraag; een teamlid reageert zodra mogelijk.",
      "Voor uitgebreide of technische vragen raden we e-mail of een geplande call aan.",
    ],
    cta: "Open contactpagina",
    href: "/contact",
  },
  {
    title: "Remote hulp (TeamViewer)",
    emailDisplay: false,
    description:
      "Voor schermgedeelde ondersteuning gebruiken we TeamViewer. Handig voor uitleg in je eigen omgeving.",
    instructions: [
      "Download TeamViewer (teamviewer.com) op je apparaat als je dat nog niet hebt.",
      "Deel je TeamViewer-ID en wachtwoord met ons via een beveiligd kanaal (bijv. e-mail of portaal).",
      "Plan een kort tijdvenster; we bellen in en begeleiden je stap voor stap.",
    ],
    cta: null,
    href: null,
  },
  {
    title: "Geplande consultatie",
    emailDisplay: false,
    description:
      "Plan een videocall of fysieke afspraak voor strategie, feedback of projectbespreking.",
    instructions: [
      "Neem contact op via de contactpagina of per e-mail met je gewenste onderwerp en beschikbaarheid.",
      "We sturen een uitnodiging met datum, tijd en link (bijv. Google Meet of Zoom).",
      "Kom voorbereid met punten die je wilt bespreken.",
    ],
    cta: "Plan een consultatie",
    href: "/contact",
  },
];

const faqs = [
  {
    question: "Hoe neem ik contact op met VDB Digital?",
    answer: `Via de contactpagina op de website of per e-mail op ${COMPANY_EMAIL}. Voor projectspecifieke vragen gebruik je het e-mailadres uit je projectcommunicatie. Je kunt ook een geplande consultatie inplannen. Voor snelle vragen kun je tijdens kantooruren de live chat gebruiken als deze beschikbaar is.`,
  },
  {
    question: "Bieden jullie remote ondersteuning aan?",
    answer:
      "Ja. We kunnen remote ondersteuning bieden via TeamViewer. Je deelt je TeamViewer-ID en wachtwoord met ons via een beveiligd kanaal; we plannen een kort tijdvenster en begeleiden je stap voor stap.",
  },
  {
    question: "Hoe plan ik een consultatie?",
    answer:
      "Stuur een e-mail of gebruik de contactpagina met je onderwerp en beschikbaarheid. We reageren met een voorstel voor datum, tijd en een videocall-link (bijv. Google Meet of Zoom).",
  },
];

export default function SupportPage() {
  return (
    <SiteShell>
      <FAQStructuredData faqs={faqs} />
      <PageTransition>
        <section className="pt-10">
          <PageHero
            eyebrow="SUPPORT"
            title="Support en contactmogelijkheden."
            description="E-mail, live chat, remote hulp via TeamViewer of een geplande consultatie. Hier vind je per methode duidelijke instructies."
          />
        </section>
        <section className="section-container pb-28">
          <div className="grid gap-10 lg:gap-14">
            {supportMethods.map((method) => (
              <article
                key={method.title}
                className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#181818] via-black to-black/95 p-6 sm:p-8"
              >
                <h2 className="text-lg font-semibold text-white">
                  {method.title}
                </h2>
                <p className="mt-2 text-sm text-gray-300/90">
                  {method.description}
                </p>
                <ol className="mt-4 list-decimal list-inside space-y-2 text-sm text-gray-300/90">
                  {method.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                {"emailDisplay" in method && method.emailDisplay && (
                  <p className="mt-4">
                    <a
                      href={COMPANY_EMAIL_MAILTO}
                      className="text-gold hover:underline font-medium text-sm"
                    >
                      {COMPANY_EMAIL}
                    </a>
                  </p>
                )}
                {method.cta && method.href && (
                  <p className="mt-4">
                    <Link
                      href={method.href}
                      className="text-gold hover:underline font-medium text-sm"
                    >
                      {method.cta} →
                    </Link>
                  </p>
                )}
              </article>
            ))}
          </div>
          <div className="mt-14 rounded-3xl border border-white/10 bg-black/60 p-6">
            <h2 className="text-sm font-semibold text-white">
              Veelgestelde vragen
            </h2>
            <ul className="mt-4 space-y-4">
              {faqs.map((faq) => (
                <li key={faq.question}>
                  <p className="font-medium text-gray-200">{faq.question}</p>
                  <p className="mt-1 text-sm text-gray-400">{faq.answer}</p>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">
            Geen antwoord gevonden? E-mail ons op{" "}
            <a href={COMPANY_EMAIL_MAILTO} className="text-gold hover:underline">
              {COMPANY_EMAIL}
            </a>{" "}
            of{" "}
            <Link href="/contact" className="text-gold hover:underline">
              neem contact op
            </Link>
            .
          </p>
        </section>
      </PageTransition>
    </SiteShell>
  );
}
