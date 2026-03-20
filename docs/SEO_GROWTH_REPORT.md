# SEO & Growth – Implementatierapport

Dit document beschrijft de SEO- en growth-optimalisaties voor het VDB Digital platform.

---

## Phase 1 — Technical SEO

### Sitemap
- **`/sitemap.xml`** wordt dynamisch gegenereerd en bevat:
  - Statische routes (home, website-scan, prijzen, tools, kennisbank, contact, etc.)
  - Nieuwe growth-pagina’s: `/website-seo-check`, `/website-snelheid-test`, `/conversie-check`
  - Programmatische SEO-pagina’s: `/seo/[slug]` (o.a. website-analyse, seo-check, seo-analyse-webshop/wordpress/shopify/saas, steden)
  - Tool-pagina’s: `/tools/[slug]`
  - Kennisbank-artikelen, producten, rapporten (share), audit-pagina’s
- Prioriteit website-scan verhoogd naar **0.95** (weekly).

### Robots.txt
- **`/robots.txt`**: Allow `/`, disallow `/admin`, `/dashboard`, `/portal`, `/login`, `/register`, `/create-account`, `/review/`
- Sitemap-URL correct ingesteld.

### Canonical, metadata, OpenGraph, Twitter
- **`lib/metadata.ts`**: `pageMetadata()` levert per pagina: title, description, **canonical**, **openGraph** (title, description, url, images), **twitter** (card, title, description).
- Alle nieuwe growth-pagina’s en bestaande SEO/tool-pagina’s gebruiken canonicals en OG/Twitter.

### JSON-LD
- **Organization**, **WebSite**, **SoftwareApplication** in root layout.
- **WebSite**: extra **SearchAction** toegevoegd met target `/website-scan` (naast contact).
- **BreadcrumbStructuredData**: nieuwe component voor BreadcrumbList; gebruikt op `/seo/[slug]`.
- **FAQPage** op growth-pagina’s (website-seo-check, website-snelheid-test, conversie-check) en op SEO-pagina’s.
- **SeoPageStructuredData** op `/seo/[slug]`, **ReportStructuredData** op rapporten, **ServiceStructuredData** op services.

### Redirects
- **`/website-scan-gratis`** → **`/website-scan`** (301)
- Bestaande redirects o.a. `/gratis-website-scan` → `/website-scan`, `/kennis` → `/kennisbank`, `/pricing` → `/prijzen`.

---

## Phase 2 — Programmatic SEO

### Bestaande programmatische pagina’s
- **`/seo/[slug]`** (o.a.):
  - website-analyse, website-analyse-gratis/online/tool/seo
  - seo-check, seo-check-gratis/online/tool
  - website-snelheid, website-snelheid-test/check/analyse
  - conversie-check, website-conversie-analyse, conversie-optimalisatie-tool
  - ai-marketing-tools, ai-seo-tools, ai-website-analyse
  - seo-audit, seo-audit-gratis
  - **seo-analyse-webshop**, **seo-analyse-wordpress**, **seo-analyse-shopify**, **seo-analyse-saas** (nieuw)
  - website-analyse-[stad] (Amsterdam, Rotterdam, Utrecht, Eindhoven, Groningen)
- **`/tools/[slug]`**: o.a. seo-analyse, seo-check, website-analyse, conversie-analyse, snelheid-test, seo-analyse-webshop/wordpress/shopify/saas/bedrijf.

### Website-scan-gratis
- Bezoekers van **`/website-scan-gratis`** worden met een vaste redirect naar **`/website-scan`** gestuurd (zie Phase 1).

---

## Phase 3 — Content / Kennisbank

- **Kennisbank** (`/kennisbank`, `/kennisbank/[slug]`): artikelen met H1 (titel), structuur via ArticleContent, table of contents.
- **ArticleLayout**: blok “Meer ontdekken” uitgebreid met interne links naar:
  - Website scan, **Website SEO check**, **Website snelheid test**, **Conversie check**, Alle tools, Kennisbank, Calculators
- Duidelijke CTA-knop: “Start gratis website analyse” → `/website-scan`.

---

## Phase 4 — Internal Linking

- **SEO-pagina’s** (`/seo/[slug]`): vaste links naar Website scan, **Website SEO check**, **Website snelheid test**, **Conversie check**, Alle tools, Kennisbank + config-specifieke `relatedLinks` (bijv. SEO analyse WordPress/Shopify/webshop).
- **Growth-pagina’s** onderling gekoppeld en naar Website scan, tools, kennisbank (incl. relevante categorieën zoals `/kennisbank/website-snelheid`, `/kennisbank/conversie`).
- **Tool-pagina’s** (`/tools/[slug]`): onderling + link naar Website scan, prijzen, tools/website-audit.
- Topic clusters: SEO (seo-check, seo-analyse-*, website-analyse), Snelheid (website-snelheid-test, kennisbank/website-snelheid), Conversie (conversie-check, kennisbank/conversie).

---

## Phase 5 — Performance

- Uit eerdere audits: code splitting, caching, images (AVIF/WebP), health cache, database select/indexes.
- Doel Lighthouse performance >90 blijft ondersteund door bestaande optimalisaties.

---

## Phase 6 — Authority

- Testimonials/reviews en sharebare rapporten bestonden al (o.a. homepage, rapport-URL’s).
- Geen extra wijzigingen in deze fase.

---

## Phase 7 — Growth-pagina’s

Drie nieuwe **root-level** landingspagina’s, elk met eigen focuszoekwoorden en CTA naar `/website-scan`:

| Pagina | Focus keywords | CTA |
|--------|----------------|-----|
| **/website-seo-check** | website SEO check, gratis SEO controle | Start gratis SEO check → /website-scan |
| **/website-snelheid-test** | website snelheid test, laadsnelheid, Core Web Vitals | Start gratis snelheidstest → /website-scan |
| **/conversie-check** | conversie check, conversie website analyse | Start gratis conversie check → /website-scan |

Elke pagina bevat:
- Unieke **title** en **meta description** (via `pageMetadata`)
- **H1** en **H2**-secties (uitleg, voordelen, CTA, FAQ)
- **FAQ**-sectie + **FAQPage** JSON-LD
- Blok **“Meer ontdekken”** met interne links naar de andere growth-pagina’s, website-scan, tools, kennisbank
- Eén duidelijke primaire CTA-knop naar `/website-scan`

---

## Bestanden gewijzigd/toegevoegd

| Bestand | Wijziging |
|---------|-----------|
| `next.config.mjs` | Redirect `/website-scan-gratis` → `/website-scan` |
| `app/sitemap.ts` | Routes website-seo-check, website-snelheid-test, conversie-check; priority/changeFrequency website-scan |
| `components/StructuredData.tsx` | WebSite SearchAction naar /website-scan; BreadcrumbStructuredData |
| `app/seo/[slug]/page.tsx` | CTA-knop gold→indigo; links naar growth-pagina’s; BreadcrumbStructuredData |
| `lib/seo-pages.ts` | Pagina **seo-analyse-saas** toegevoegd |
| `app/website-seo-check/page.tsx` | **Nieuw** – growth-pagina SEO check |
| `app/website-snelheid-test/page.tsx` | **Nieuw** – growth-pagina snelheidstest |
| `app/conversie-check/page.tsx` | **Nieuw** – growth-pagina conversie check |
| `components/kennisbank/ArticleLayout.tsx` | Uitgebreide interne links (growth + kennisbank) |
| `docs/SEO_GROWTH_REPORT.md` | **Nieuw** – dit rapport |

---

## Aanbevelingen vervolg

1. **Lighthouse**: regelmatig Lighthouse (SEO + Performance) draaien en eventueel in CI opnemen.
2. **Search Console**: property aanmaken, sitemap indienen, queries en indexering monitoren.
3. **Content**: kennisbank uitbreiden met artikelen over SEO, snelheid, conversie; interne links vanuit nieuwe artikelen naar growth- en tool-pagina’s.
4. **Authority**: testimonials/case studies expliciet bij nieuwe growth-pagina’s of in een aparte “Ervaringen”-sectie hergebruiken.
