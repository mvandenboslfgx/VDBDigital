# VDB Digital — ULTRA BUILD Prompt (Elite SaaS in één keer)

Gebruik dit document in Cursor om het platform naar **elite SaaS-niveau** te tillen. De marketing site heeft al een **premium light theme** (Apple/Stripe-stijl); dit prompt focust op **design system consistentie**, **UI-componentbibliotheek** en **dashboard redesign**.

---

## Doel

Bouw VDB Digital als een **top tech product** dat voelt als Linear, Stripe, Notion en Vercel: strak, rustig, professioneel. Alle teksten in **Nederlands**.

**Stack:** Next.js 15 (App Router), TypeScript, TailwindCSS, Framer Motion, Supabase, Prisma, Stripe.

---

# 1. Premium Light Design System

Het design system moet overal hetzelfde aanvoelen.

## Kleuren

| Gebruik           | Waarde     | Tailwind / CSS                    |
|-------------------|------------|------------------------------------|
| Achtergrond       | `#FFFFFF`  | `bg-marketing-bg` of `bg-white`   |
| Surface / cards   | `#F8F9FB`  | `bg-marketing-surface`            |
| Borders           | `#E5E7EB`  | `border-marketing-border`         |
| Primaire tekst    | `#0F172A`  | `text-marketing-text`             |
| Secundaire tekst  | `#475569`  | `text-marketing-textSecondary`    |
| Accent (goud)     | `#C6A95D`  | `bg-gold`, `text-gold`            |
| Accent hover      | `#B89B50`  | `hover:bg-goldHover`              |

**Dashboard blijft donker:** `bg-[#0a0a0b]`, `text-white`, `text-zinc-400`. Alleen de **marketing**-pagina’s (SiteShell) gebruiken het light theme.

## Typography

- **Font:** Inter (al in `app/layout.tsx`).
- **Hero-titel:** `text-5xl font-semibold` (of `text-display-lg`).
- **Sectietitel:** `text-3xl font-semibold`.
- **Body:** `text-base`; voldoende line-height (bijv. 1.6).
- **Spacing:** 8, 16, 24, 32, 48, 64 px (Tailwind: `space-2` t/m `space-16`).

## Kaarten (marketing)

- `rounded-2xl`
- `border border-marketing-border`
- `bg-white` of `bg-marketing-surface`
- `shadow-marketing-card`; hover: `shadow-marketing-card-hover`
- `transition-shadow` of `transition-all duration-200`

## Knoppen

- **Primary:** goud (`bg-gold`), donkere tekst, `rounded-xl`, hover: `bg-goldHover` en optioneel subtiele shadow.
- **Secondary:** lichte border (`border-marketing-border`), donkere tekst, hover: lichte achtergrond.

---

# 2. SaaS UI Component Library

**Bestaande componenten** (in `components/ui/`):  
`Button`, `Card`, `Section`, `Input`, `Modal`, `Panel`, `Badge`, `MetricCard`, `DashboardWidget`, `ScoreRing`, `Skeleton`, `ErrorFallback`.

**Toevoegen of uitbreiden:**

| Component      | Doel                                         | Eisen |
|----------------|----------------------------------------------|--------|
| **Container**  | Max-width + padding voor content             | Hergebruik of formaliseer `section-container` (bv. in `Section` of eigen `Container`). |
| **FeatureCard**| Marketing: icoon + titel + korte tekst      | Light theme, subtiele shadow, hover lift. |
| **ToolCard**   | Tools-pagina: icoon, titel, beschrijving, CTA| Zelfde stijl als FeatureCard, duidelijke “Open tool”-knop. |
| **PricingCard**| Prijsblokken op /prijzen                    | Optioneel variant voor highlighted plan (goud rand). |
| **Dropdown**   | Acties, filters, menu’s                      | Toegankelijk (focus, Escape), Framer Motion voor open/dicht. |
| **Tabs**       | Tabbladen in tools of rapporten             | Toegankelijk, duidelijke actieve staat. |
| **Table**      | Overzichten (rapporten, websites)           | Striped of borders, responsive. |
| **Tooltip**    | Korte uitleg bij icoon of label             | Toegankelijk, niet op mobile als enige info. |

**Algemeen voor alle componenten:**

- TypeScript-types voor props.
- Tailwind voor styling.
- Subtiele animaties met Framer Motion (hover, mount).
- Accessible: focus, aria-labels, keyboard.

---

# 3. Dashboard Redesign

Het dashboard moet aanvoelen als een **wereldklasse SaaS-app** (Linear/Stripe/Vercel/Notion).

## Layout (blijft)

- **Sidebar links** (`DashboardNav` in `components/dashboard/DashboardNav.tsx`).
- **Header boven** (in `app/dashboard/layout.tsx`).
- **Main content** rechts.

## Sidebar

- **Icons bij elk nav-item** (bijv. Lucide of een klein icon set).
- Items: Dashboard, Website audits (Scans), Reports, AI tools, Calculators, Websites, (Clients alleen voor bepaalde rollen), Billing, Settings.
- Actief item: duidelijke achtergrond (`bg-white/[0.06]` of vergelijkbaar) en lichtere tekst.
- Beperkte breedte (bv. `w-56`), sticky.

## Header

Toevoegen of verduidelijken:

- **Zoekbalk** (optioneel: zoek in rapporten/websites).
- **Notificaties** (NotificationBell staat er al).
- **Gebruiker + e-mail** (staat er al).
- **Plan-indicator:** huidige plan (Gratis/Starter/Growth/Agency) met link naar Billing.

## Main dashboard (overview)

- **Overzichtskaarten** (zoals nu, maar visueel strakker):
  - Websites geanalyseerd (of aantal scans).
  - Gemiddelde SEO-score (indien beschikbaar).
  - AI-usage deze maand.
  - Recente rapporten (laatste 3–5).
- **Charts:** waar het past (bijv. usage over tijd, scores trend) met een eenvoudige chart library of CSS.

## Report-detailpagina (`/dashboard/reports/[id]`)

- **Score-cirkels** voor SEO, Performance, UX, Conversion (ScoreRing bestaat al).
- Duidelijke **verbeterpunten** (recommendations).
- Optioneel **tabs** voor Technische data / Samenvatting / Acties.
- Strakke typografie en spacing.

## Tools-pagina (`/dashboard/ai-tools`)

- **Grid van tool-cards.**
- Per tool: **icoon**, **titel**, **korte beschrijving**, **knop** “Open tool” of “Start”.
- Eenduidige stijl (zelfde card-component).

---

# 4. Premium polish (“1-biljoen gevoel”)

Overal toepassen waar het past:

- **Zachte schaduwen:** bv. `shadow-marketing-card`, `shadow-marketing-card-hover` op marketing; in dashboard bestaande `shadow-panel` / `shadow-elevated`.
- **Subtiele gradients:** bv. heel lichte gold-gradient in hero of CTA (al aanwezig); niet overdrijven.
- **Hover:** lichte lift (`hover:-translate-y-0.5`) of lichtere shadow op cards en knoppen.
- **Transitions:** `transition-all duration-200` of `transition-shadow` op interactieve elementen.
- **Ruimte:** voldoende padding/margin (bijv. `space-8`, `py-12`).
- **Grote, duidelijke titels** waar het past (hero, secties, dashboard-blokken).

**Doel:** Bezoeker begrijpt het platform binnen een paar seconden; rustig en professioneel.

---

# 5. Optioneel: Next level

Als je nog een stap verder wilt:

1. **Interactieve AI-scananimatie**  
   Tijdens “Website wordt geanalyseerd…”: stappen (SEO → Performance → UX → Conversie) met korte animatie of progress (al deels in `WebsiteScanSection`).

2. **Viral report pages**  
   `/report/[slug]` al aanwezig; uitbreiden met:
   - Sterke SEO-metadata.
   - Share-knoppen (LinkedIn, Twitter, e-mail).
   - Duidelijke CTA naar upgrade of volgende scan.

3. **Super duidelijke productpagina**  
   Eén pagina (of sectie) die in één oogopslag toont: wat is het, voor wie, welke tools, prijzen, CTA. Bijv. uitbreiden van de homepage of een dedicated `/product` of `/hoe-het-werkt`.

---

# Hoe dit in Cursor te gebruiken

1. **Per onderdeel:** Kopieer alleen sectie 1, of 2, of 3, en vraag Cursor: “Implementeer dit voor VDB Digital volgens de bestaande stack en bestandsstructuur.”
2. **In één keer:** Plak het hele document en vraag: “Voer het ULTRA BUILD plan uit: design system consistentie, ontbrekende UI-componenten, en dashboard redesign zoals beschreven. Behoud bestaande functionaliteit en Nederlandse teksten.”
3. **Volgorde:** Eerst 1 (design system) + 2 (components), daarna 3 (dashboard), dan 4 (polish). Sectie 5 optioneel.

---

*VDB Digital — Elite SaaS ULTRA BUILD. Marketing = light (Apple/Stripe). Dashboard = dark (Linear/Vercel).*
