# VDB Digital – Full platform audit

**Datum:** 8 maart 2026  
**Scope:** structuur, navigatie, links, UI-consistentie, SEO, performance, beveiliging.

---

## 1. Navigatiestructuur

### Hoofdnavigatie (Navbar)
- **Home** → `/`
- **Platform** → `/platform` + 6 subpagina’s (hoe-het-werkt, website-analyse, ai-technologie, rapport-systeem, agencies, integraties)
- **Tools** → `/tools` + 6 tool-subpagina’s
- **Apparaten** → `/apparaten` + 3 productpagina’s
- **Kennisbank** → `/kennisbank` + 5 categorieën
- **Calculators** → `/calculators` + 6 calculators
- **Prijzen** → `/prijzen` + anchors

Alle navbar-links verwijzen naar bestaande routes.

### Footer
- Product: website-scan, tools, kennisbank, seo/website-analyse, prijzen, dashboard
- Informatie: hoe-het-werkt, over-ons, contact, help, privacy, voorwaarden, cookies, disclaimer
- **Aanpassing gedaan:** Kennisbank-link in footer van `/kennis` naar `/kennisbank` gezet (canonical).

---

## 2. Broken links & ontbrekende pagina’s

### Geen broken links
- Alle in de navbar en footer genoemde paden hebben een `page.tsx`.
- `/kennis` redirect naar `/kennisbank` (next.config).

### Dubbele/legacy routes
- **Oude juridische URLs:** `/privacy-policy`, `/legal-notice`, `/cookie-policy` bestaan nog als pagina’s; de sitemap gebruikt nu `/privacy`, `/voorwaarden`, `/cookies`.
- **Aanpassing gedaan:** Redirects toegevoegd: `privacy-policy` → `privacy`, `legal-notice` → `voorwaarden`, `cookie-policy` → `cookies`, `pricing` → `prijzen`.

### Interne links in componenten
- **ReportPublicClient:** linkt naar `/kennis/seo` → redirect naar `/kennisbank/seo` (OK).
- **UpgradeBanner, UpgradeModal:** linken naar `/pricing` → nu redirect naar `/prijzen`.
- **ToolTeaser, FinalCta:** linken naar `/register`; zowel `/register` als `/create-account` bestaan; overweeg één canonical (bijv. redirect `/register` → `/create-account`).

---

## 3. UI-consistentie & design system

### Kleuren (Tailwind)
- **Marketing (light):** `marketing.bg`, `marketing.surface`, `marketing.border`, `marketing.text`, `marketing.textSecondary`, `marketing.textMuted` – consistent gedefinieerd.
- **Accent:** `gold`, `goldHover` – gebruikt op knoppen en links.
- **Dashboard:** donkere tokens (`background`, `surface`, `border`, etc.) gescheiden van marketing.

### Mogelijke inconsistenties
- Enkele oudere componenten (bijv. `Hero.tsx`, `Packages.tsx`, `FinalCta.tsx`, `Services.tsx`) gebruiken mogelijk eigen class-namen (bijv. `btn-primary`) in plaats van de design-tokens; controleren waar ze nog op marketingpagina’s worden gebruikt.
- Overal waar “premium light” moet zijn: expliciet `text-marketing-text`, `text-marketing-textSecondary`, `border-slate-200`, `bg-white` e.d. gebruiken.

### Aanbeveling
- Eenmalig alle marketingpagina’s nalopen en oude `btn-*` of hardcoded gray/black vervangen door design-system classes.

---

## 4. SEO

### Sterke punten
- **Metadata:** Veel pagina’s gebruiken `pageMetadata()` (title, description, canonical, Open Graph, Twitter).
- **Sitemap:** Dynamisch; bevat statische routes, work, SEO-slugs, kennisbank-artikelen; juridische pagina’s op `/privacy`, `/voorwaarden`, `/cookies`, `/disclaimer`.
- **Structured data:** SEO-pagina’s (Article, FAQ, Organization, WebSite); rapporten en kennisbank-artikelen (Article).
- **robots.txt:** Aanwezig; `disallow: /admin`, `/dashboard`, `/login`, `/register`, `/review/`; sitemap gelinkt.

### Aanbevelingen
- **robots:** Overweeg `/portal` toe te voegen aan `disallow` als die niet geïndexeerd moet worden.
- **Canonical:** Nieuwe pagina’s standaard `pageMetadata` met `path` geven voor canonical URL.
- **Duplicate content:** `/hoe-het-werkt` en `/platform/hoe-het-werkt` kunnen overlap hebben; overweeg canonical naar één variant of duidelijke inhoudelijke scheiding.

---

## 5. Performance

### Positief
- **next/image** gebruikt in o.a. Navbar, Footer, dashboard.
- **next/font** (Inter) in layout.
- **Dynamic imports** voor o.a. FAQSection (dynamic).
- **Static/ISR:** SEO-pagina’s statisch; kennisbank `revalidate = 3600`; rapporten met revalidate.

### Aanbevelingen
- Grote lijsten (bijv. admin-tabellen) overwegen te lazy-loaden of pagineren.
- Zware client components (bijv. dashboard charts) met `dynamic(..., { ssr: false })` alleen waar nodig.
- Bundle analyser (bijv. `@next/bundle-analyzer`) eens draaien om grote dependencies te vinden.

---

## 6. Beveiliging

### Sterke punten
- **Middleware:** Bescherming voor `/dashboard`, `/portal`, `/admin`; redirect naar login zonder user; owner-only admin-routes gecontroleerd via API role.
- **API:** 
  - AI-routes: `validateOrigin`, `rateLimitAi`, input sanitization (o.a. `sanitizeString`, `sanitizeWebsiteUrl`).
  - Auth: `rateLimitAuth`, lockout.
  - Sensitive (contact, newsletter, etc.): `rateLimitSensitive`, `validateOrigin`.
  - Admin content-generator en control-center: `requireAdminOrOwner` / `requireOwner`.
- **Headers:** CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy in next.config.

### Aanbevelingen
- **CSP:** `script-src` bevat `'unsafe-inline'` en `'unsafe-eval'`; op termijn verkleinen voor strengere CSP (bijv. nonces).
- **Stripe webhooks:** Controleren of webhook-signatuur in alle webhook-handlers wordt gevalideerd.
- **Env:** Geen secrets in client code; gevoelige config alleen server-side (bijv. `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`).

---

## 7. Code & architectuur

### Structuur
- **App Router:** Duidelijke mappen per domein (app, admin, dashboard, tools, kennisbank, seo, etc.).
- **Componenten:** SiteShell, Navbar, Footer centraal; home-secties, kennisbank, report, tools gescheiden.
- **Lib:** auth, permissions, rateLimit, apiSecurity, metadata, prisma, openai – logisch opgesplitst.

### Mogelijke verbeteringen
- **Dubbele pagina’s:** Er bestaan zowel `/kennis/[category]` als `/kennisbank/[slug]`; na redirect van `/kennis` naar `/kennisbank` kan `app/kennis/` op termijn worden opgeruimd of alleen als redirect-layer blijven.
- **Legacy routes:** `/privacy-policy`, `/legal-notice`, `/cookie-policy` kunnen na redirect worden verwijderd of dunne redirect-pagina’s worden (nu afgehandeld via next.config redirects).
- **Register vs create-account:** Eén canonical route voor registratie kiezen en de andere redirecten.

---

## 8. Uitgevoerde fixes (deze audit)

1. **Redirects (next.config.mjs):**
   - `/privacy-policy` → `/privacy`
   - `/legal-notice` → `/voorwaarden`
   - `/cookie-policy` → `/cookies`
   - `/pricing` → `/prijzen`

2. **Footer:** Link “Kennisbank” van `/kennis` naar `/kennisbank` gezet.

---

## 9. Aanbevolen vervolgstappen

| Prioriteit | Actie |
|-----------|--------|
| Hoog | Stripe webhook-handlers controleren op signature verification. |
| Hoog | Eén registratie-URL kiezen; andere redirecten (bijv. `/register` → `/create-account`). |
| Medium | Oude legal pages (`privacy-policy`, `legal-notice`, `cookie-policy`) verwijderen of vervangen door redirect-only. |
| Medium | UI-audit: alle marketing-componenten op design-tokens (marketing.*, gold, slate) zetten. |
| Laag | robots.txt: overwegen `/portal` toe te voegen aan disallow. |
| Laag | Bundle-analyzer draaien en grote dependencies beperken. |

---

Dit document kan worden hergebruikt voor volgende audits of als checklist vóór productie.
