import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import Link from "next/link";

const SECTIONS = [
  {
    title: "Webshop",
    description: "Producten, bestellingen en voorraad",
    links: [
      { label: "Producten", href: "/admin/products", desc: "Beheer producten, prijzen, afbeeldingen" },
      { label: "Bestellingen", href: "/admin/orders", desc: "Overzicht van orders" },
    ],
  },
  {
    title: "Gebruikers & leads",
    description: "Accounts, leads en klanten",
    links: [
      { label: "Accounts", href: "/admin/users", desc: "Gebruikers en rollen" },
      { label: "Leads", href: "/admin/leads", desc: "Inkomende leads" },
      { label: "Clients", href: "/admin/clients", desc: "Klantgegevens" },
    ],
  },
  {
    title: "Financiën",
    description: "Betalingen, abonnementen en facturen",
    links: [
      { label: "Betalingen", href: "/admin/betalingen", desc: "Stripe-betalingen" },
      { label: "Finance", href: "/admin/finance", desc: "MRR, omzet, overzicht" },
      { label: "Facturen", href: "/admin/invoices", desc: "Facturen beheren" },
      { label: "Plans", href: "/admin/plans", desc: "Abonnementsplannen" },
    ],
  },
  {
    title: "Content & marketing",
    description: "Teksten, content en communicatie",
    links: [
      { label: "Content Generator", href: "/admin/content-generator", desc: "AI-artikelen genereren" },
      { label: "Newsletter", href: "/admin/newsletter", desc: "Nieuwsbriefabonnees" },
      { label: "Reviews", href: "/admin/reviews", desc: "Beoordelingen" },
    ],
  },
  {
    title: "Platform & systeem",
    description: "Technisch beheer en instellingen",
    links: [
      { label: "Control Center", href: "/admin/control-center", desc: "Live metrics en activiteit" },
      { label: "Dashboard", href: "/admin/dashboard", desc: "Overzicht met CMS-panel" },
      { label: "AI Usage", href: "/admin/ai-usage", desc: "AI-verbruik en kosten" },
      { label: "Analytics", href: "/admin/analytics", desc: "Statistieken" },
      { label: "System", href: "/admin/system", desc: "Systeemstatus" },
      { label: "Logs", href: "/admin/logs", desc: "Applicatielogs" },
      { label: "Settings", href: "/admin/settings", desc: "Platforminstellingen" },
    ],
  },
];

export default async function SiteBeheerPage() {
  const user = await requireOwner();
  if (!user) redirect("/dashboard");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Site Beheer</h1>
        <p className="mt-1 text-sm text-gray-400">
          Beheer de hele site vanuit dit overzicht. Kies een sectie om te starten.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-400/90">
              {section.title}
            </h2>
            <p className="mt-1 text-xs text-zinc-500">{section.description}</p>
            <ul className="mt-4 space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-lg px-3 py-2.5 text-sm text-white transition-colors hover:bg-white/10 hover:text-amber-400/90"
                  >
                    <span className="font-medium">{link.label}</span>
                    <span className="ml-2 text-xs text-zinc-500">— {link.desc}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
        <h2 className="text-sm font-semibold text-amber-400/90">Snelle acties</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="rounded-xl bg-amber-500/20 px-4 py-2.5 text-sm font-medium text-amber-400 hover:bg-amber-500/30 transition-colors"
          >
            + Nieuw product
          </Link>
          <Link
            href="/admin/leads"
            className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition-colors"
          >
            Leads bekijken
          </Link>
          <Link
            href="/admin/betalingen"
            className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition-colors"
          >
            Betalingen
          </Link>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
          >
            Site bekijken →
          </Link>
        </div>
      </div>
    </div>
  );
}
