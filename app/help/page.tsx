import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Help",
  description: "Veelgestelde vragen en ondersteuning voor VDB Digital: website-scan, rapporten, prijzen en account.",
  path: "/help",
});

const faqs = [
  {
    q: "Hoe voer ik een website-scan uit?",
    a: "Ga naar Website analyseren, voer uw website-URL in en klik op de knop. U ontvangt binnen enkele seconden een rapport met scores en verbeterpunten. Voor het volledige rapport heeft u een (gratis) account nodig.",
  },
  {
    q: "Wat betekenen de scores?",
    a: "Elk rapport bevat vier scores (0–100): SEO, UX, conversie en prestaties. Ze zijn gebaseerd op feitelijke data van uw website. In het rapport vindt u ook technische data (bijv. H1-tags, afbeeldingen zonder alt) en een betrouwbaarheidsindicator.",
  },
  {
    q: "Hoe kan ik mijn plan wijzigen?",
    a: "Log in en ga naar Dashboard → Facturatie. Daar kunt u upgraden of uw abonnement beheren via de betaalprovider.",
  },
  {
    q: "Waar vind ik mijn rapporten?",
    a: "Na inloggen vindt u uw rapporten onder Dashboard → Rapporten. U kunt rapporten ook delen via een link.",
  },
  {
    q: "Ik heb een andere vraag",
    a: "Neem contact met ons op via de contactpagina. We reageren zo snel mogelijk.",
  },
];

export default function HelpPage() {
  return (
    <SiteShell>
      <div className="section-container py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-heading">Help</p>
          <h1 className="section-title mt-2">Veelgestelde vragen</h1>
          <p className="text-sub mt-4">
            Antwoorden op de meest gestelde vragen over website-scan, rapporten en account.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl space-y-6">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="rounded-2xl border border-white/[0.06] bg-[#111113]/80 p-6"
            >
              <h2 className="font-semibold text-white">{faq.q}</h2>
              <p className="mt-2 text-sm text-zinc-400">{faq.a}</p>
            </div>
          ))}
        </div>
        <p className="mt-12 text-center text-sm text-zinc-500">
          <Link href="/contact" className="text-gold hover:underline">Contact opnemen</Link>
          {" · "}
          <Link href="/hoe-het-werkt" className="text-gold hover:underline">Hoe het werkt</Link>
        </p>
      </div>
    </SiteShell>
  );
}
