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
    a: "Ga naar Website scan, voer uw website-URL in en klik op de knop. U ontvangt een voorvertoning met scores. Voor het volledige rapport en het opslaan van rapporten heeft u een (gratis) account nodig; met een gratis account krijgt u 1 scan per maand.",
  },
  {
    q: "Wat als ik opzeg? Wat blijft er over?",
    a: "Als u uw betaalde abonnement opzegt, gaat u terug naar het gratis plan. U behoudt toegang tot uw account en uw rapporten blijven zichtbaar. U krijgt weer 1 gratis scan per maand. Opzeggen kan via Dashboard → Facturatie (Stripe). Zie ook onze algemene voorwaarden.",
  },
  {
    q: "Wat betekenen de scores?",
    a: "Elk rapport bevat vier scores (0–100): SEO, UX, conversie en prestaties. Ze zijn gebaseerd op feitelijke data van uw website. In het rapport vindt u ook technische data (bijv. H1-tags, afbeeldingen zonder alt) en een betrouwbaarheidsindicator.",
  },
  {
    q: "Hoe kan ik mijn plan wijzigen of opzeggen?",
    a: "Log in en ga naar Dashboard → Facturatie. Daar kunt u upgraden of uw abonnement beheren en opzeggen via het Stripe-klantenportaal.",
  },
  {
    q: "Waar vind ik mijn rapporten?",
    a: "Na inloggen vindt u uw rapporten onder Dashboard → Rapporten. U kunt rapporten ook delen via een link.",
  },
  {
    q: "Ik heb een andere vraag",
    a: "Neem contact met ons op via de contactpagina. Voor voorwaarden, privacy en prijzen: zie de links onderaan deze pagina.",
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
          <Link href="/contact" className="text-indigo-400 hover:text-indigo-300 hover:underline">Contact opnemen</Link>
          {" · "}
          <Link href="/prijzen" className="text-indigo-400 hover:text-indigo-300 hover:underline">Prijzen</Link>
          {" · "}
          <Link href="/voorwaarden" className="text-indigo-400 hover:text-indigo-300 hover:underline">Voorwaarden</Link>
          {" · "}
          <Link href="/hoe-het-werkt" className="text-indigo-400 hover:text-indigo-300 hover:underline">Hoe het werkt</Link>
        </p>
      </div>
    </SiteShell>
  );
}
