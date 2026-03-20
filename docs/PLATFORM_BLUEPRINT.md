# VDB Digital – Platform Blueprint

Architectuur, design en features in één overzicht. Gebruik voor onboarding, groei en consistentie.

---

## 1. Platformoverzicht

VDB Digital is een **digitaal ecosysteem** dat combineert:

| Onderdeel | Doel | Doelgroep |
|-----------|------|-----------|
| **AI SaaS** | Website-analyses, rapporten, scores (SEO, performance, UX, conversie) | Ondernemers, marketers |
| **Tools** | Website-audit, SEO keyword finder, conversie/performance/concurrentie-analyzer, content/copy/marketingstrategie | Pro-gebruikers |
| **Kennisbank** | Artikelen (SEO, snelheid, conversie, AI, strategie) + AI-gegenereerde content | Iedereen |
| **Calculators** | ROI, break-even, prijsverhoging, freelancer-tarief, korting, abonnement vs eenmalig | Ondernemers |
| **Hardware webshop** | Smart TV / streaming-apparaten (cart + checkout; Stripe bij go-live) | Consumenten / B2B |
| **Dashboard** | Overzicht, websites, scans, rapporten, AI-tools, calculators, apparaten, bestellingen, facturatie, instellingen | Ingelogde gebruikers |
| **Admin** | Control center, users, leads, content generator, products, orders, finance, AI usage, plans, analytics, system | Owner/Admin |

---

## 2. Tech stack

| Laag | Technologie |
|------|-------------|
| Framework | Next.js 15 (App Router) |
| Taal | TypeScript |
| Styling | TailwindCSS |
| Animaties | Framer Motion |
| Auth & DB | Supabase (auth), PostgreSQL (Prisma) |
| Betalingen | Stripe (subscriptions + later hardware) |
| AI | OpenAI API |
| Queue (audits) | Redis + BullMQ |
| Hosting | Vercel (of vergelijkbaar) |

---

## 3. Mapstructuur (architectuur)

```
app/
  (marketing)     page.tsx, website-scan, over-ons, contact, privacy, voorwaarden, cookies, disclaimer, prijzen, …
  platform/       [slug] (hoe-het-werkt, website-analyse, ai-technologie, …)
  tools/          page + [tool] (website-audit, seo-keyword-finder, …)
  kennisbank/     page + [slug] (categorieën + DB-artikelen)
  calculators/    page + [slug] (roi, break-even, …)
  seo/            [slug] (programmatische SEO-pagina’s)
  apparaten/      page + [slug] (producten), cart, checkout
  dashboard/      overzicht, audits, websites, reports, orders, billing, settings, …
  admin/          control-center, users, leads, content-generator, products, orders, finance, …
  api/            auth, stripe, ai/*, admin/*, …
components/
  SiteShell, Navbar, SiteFooter
  home/*          Hero, Trust, WebsiteScan, HowItWorks, Toolkit, PricingStrip, FAQ, …
  tools/*         ToolCard, ToolLayout, ToolLandingSection
  kennisbank/*    ArticleLayout, ArticleContent
  report/*        ReportPublicClient, ShareButtons, …
  dashboard/*     DashboardNav, …
  admin/*         ControlCenterLive, OwnerSidebar, …
modules/          audit, ai, deploy, email (domeinlogica)
lib/              auth, permissions, rateLimit, apiSecurity, stripe, prisma, metadata, openai, …
prisma/           schema.prisma (Lead, User, Plan, Article, AuditReport, …)
```

---

## 4. Design system

### Kleuren (marketing – light)

| Token | Gebruik | Hex |
|-------|---------|-----|
| Background | Pagina-achtergrond | #F8FAFC |
| Surface / cards | Kaarten, panels | #FFFFFF |
| Border | Randen | #E2E8F0 |
| Primary text | Hoofdtekst | #0F172A |
| Secondary text | Ondertitels | #334155 |
| Muted text | Tertiaire tekst | #64748B |
| Accent | Knoppen, links | #C6A95D |
| Accent hover | Hover | #B89B50 |

### Typography

- **Font:** Inter (next/font).
- **Hero:** `text-5xl` / `text-6xl`, font-semibold.
- **Sectietitels:** `text-3xl` / `text-4xl`, font-semibold.
- **Body:** `text-lg`, `text-marketing-textSecondary` of `text-slate-700`.

### Componenten

- **Kaarten:** `bg-white border border-slate-200 rounded-2xl shadow-sm p-8`.
- **Primaire knop:** `bg-gold text-black rounded-xl hover:bg-goldHover`, grotere varianten `px-8 py-4 text-lg font-semibold`.
- **Secties:** afwisselend `bg-white` en `bg-slate-50`; spacing `py-24` / `py-32`.

### Dashboard (dark)

- Achtergrond: `background` (#0a0a0b), `surface` (#111113).
- Accent blijft gold voor actieve states en knoppen.

---

## 5. Navigatie

### Hoofdmenu (navbar)

- Home → `/`
- Platform → `/platform` (dropdown: hoe-het-werkt, website-analyse, ai-technologie, rapport-systeem, agencies, integraties)
- Tools → `/tools` (dropdown: website-audit, seo-keyword-finder, conversion-analyzer, …)
- Apparaten → `/apparaten` (dropdown: smart-tv-box-pro, streaming-box-mini, accessoires)
- Kennisbank → `/kennisbank` (dropdown: seo, website-snelheid, conversie, ai-marketing, digitale-strategie)
- Calculators → `/calculators` (dropdown: roi, break-even, prijsverhoging, …)
- Prijzen → `/prijzen` (dropdown: overzicht, starter, growth, agency)

Rechts: Winkelwagen → `/cart`, Inloggen → `/login`, Account maken → `/create-account` (of Dashboard wanneer ingelogd).

### Footer

- Product: Website analyseren, Tools, Kennisbank, Website analyse (SEO), Prijzen, Dashboard.
- Informatie: Hoe het werkt, Over ons, Contact, Help, Privacybeleid, Algemene voorwaarden, Cookiebeleid, Disclaimer.
- Social: LinkedIn, Instagram.

---

## 6. Belangrijke routes

| Route | Type | Opmerking |
|-------|------|------------|
| `/` | Marketing | Homepage (hero, trust, scan, how it works, tools, hardware, kennisbank, pricing, FAQ, CTA) |
| `/website-scan` | Marketing | Start website-analyse (CTA) |
| `/platform`, `/platform/[slug]` | Marketing | Uitleg platform |
| `/tools`, `/tools/[tool]` | Marketing | Tool-overzicht + toolpagina’s |
| `/kennisbank`, `/kennisbank/[slug]` | Marketing | Categorieën + artikelen (DB) |
| `/calculators`, `/calculators/[slug]` | Marketing | Calculators (interactief) |
| `/seo/[slug]` | SEO | Programmatische SEO (statisch) |
| `/apparaten`, `/apparaten/[slug]`, `/cart`, `/checkout` | Shop | Producten, winkelwagen, checkout (Stripe bij go-live) |
| `/prijzen` | Marketing | Abonnementen |
| `/dashboard/*` | App | Alleen ingelogd |
| `/admin/*` | App | Alleen admin/owner |
| `/report/[slug]` | Marketing | Publieke rapporten (shareable) |

---

## 7. Beveiliging (kort)

- **Auth:** Supabase; middleware beschermt `/dashboard`, `/portal`, `/admin`; owner-only routes in admin.
- **API:** Rate limiting (AI, auth, sensitive); `validateOrigin` op publieke AI/contact; input sanitization; admin-endpoints `requireOwner` / `requireAdminOrOwner`.
- **Stripe:** Webhook signature verification; idempotency via `ProcessedStripeEvent`; checkout rate limited.
- **Headers:** CSP, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy.

---

## 8. SEO (kort)

- **Metadata:** `pageMetadata()` (title, description, canonical, OG, Twitter) op belangrijke pagina’s.
- **Sitemap:** Dynamisch (statische routes, work, seo-slugs, kennisbank-artikelen, juridisch).
- **Structured data:** Article, FAQPage, Organization, WebSite op SEO- en kennisbankpagina’s; rapporten Article.
- **robots.txt:** disallow /admin, /dashboard, /login, /register, /review/; sitemap gelinkt.

---

## 9. VDB OS — AI engines & bouwvolgorde

**VDB OS** is de productlaag bovenop dit blueprint: geen tweede codebase, wel **duidelijke engine-grenzen** en **gefaseerde delivery** (anders: chaos en technische schuld).

### Engines (logische modules)

| Engine | Taak | Richting in codebase |
|--------|------|----------------------|
| **Audit** | SEO / UX / performance / conversie analyseren | `modules/audit`, audit-API’s, rapporten |
| **Fix** | Suggesties + (waar veilig) toepassen | aparte stap na audit; altijd traceerbaar (wie/wat/wanneer) |
| **Generate** | Site/webshop uit prompt → structuur + pages | aparte pipeline; output als data + templates, niet “willekeurige repo-dump” |
| **Content** | SEO-teksten, landingspagina’s | `modules/ai`, content generator/admin |
| **Ad** | Metrieken, campagnes | bestaand ads-pad + workers |

### Automatisering

- **Queue:** Redis + BullMQ zit al in de stack; jobs (`analyzeWebsite`, `generateSite`, …) horen **één** job-definitie en idempotente handlers.
- **Workers:** draaien als aparte processen (zoals `audit:worker`, `ads:metrics:worker`); geen zware generatie in request/response.

### Data & “Project”

- **Prisma-schema in deze repo** is de bron van waarheid (`User`, `Client`, `Website`, `Project`, audits, …) — geen vereenvoudigd parallelmodel blijven bijhouden.
- Nieuwe builder-features: **uitbreiden** met o.a. gestructureerde JSON voor pages/products en migraties, niet losse JSON zonder schema.

### Realistische fasering

1. **MVP-platform:** landing + dashboard + analyser + duidelijke AI-output (geen “alles tegelijk”).
2. **Generator:** prompt → **data + preview** eerst; pas daarna export/deploy.
3. **Automation + schaal:** meer jobs, monitoring, deployment (Vercel API) als harde productstap met secrets & tenancy.

---

## 10. Documentatie in dit project

| Document | Inhoud |
|----------|--------|
| `docs/VISION_1B_PLATFORM.md` | **Strategische visie:** route naar $1B-platform, 10x-functies, growth loops, moats, nieuwe producten, revenue, architectuur. |
| `docs/PLATFORM_AUDIT.md` | Eerste platform-audit (links, SEO, security, UI). |
| `docs/SUPER_QA_REPORT.md` | Production readiness (12 checks, 10k users). |
| `docs/TECHNICAL_ROADMAP.md` | Volgorde van verbeteringen (security, performance, SEO, UX, schaal). |
| `docs/PLATFORM_BLUEPRINT.md` | Dit document: architectuur, design, features, VDB OS-laag. |
| `docs/DESIGN_SYSTEM.md` | Uitgewerkt design system (indien aanwezig). |
| `docs/DEPLOY.md` | Deployment en env (indien aanwezig). |

---

Dit blueprint kan worden gebruikt voor onboarding van developers, voor Cursor/AI-prompts en voor het consistent houden van structuur en design bij uitbreidingen.
