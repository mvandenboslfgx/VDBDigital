# VDB Digital – SUPER QA / Production Readiness Report

**Scenario:** 10.000+ actieve gebruikers, 500 API-requests/min, 100 AI-tool executions/min.  
**Datum:** 8 maart 2026.

---

## Executive summary

De codebase is **production-ready** met een duidelijke architectuur, sterke beveiliging (Stripe webhook, rate limiting, auth) en goede SEO. Onderstaande punten zijn verbeteringen en aanbevelingen voor schaal en hardheid; geen blokkerende issues.

---

## CHECK 1 — Application structure

### Bevindingen
- **App Router:** Logische opbouw: `app/` (marketing), `app/dashboard/`, `app/admin/`, `app/tools/`, `app/kennisbank/`, `app/seo/`, `app/api/`.
- **Componenten:** `components/` met SiteShell, Navbar, Footer, home-secties, report, tools, kennisbank, admin, dashboard – goed gescheiden.
- **Modules:** `modules/` voor audit, AI, deploy, email – domeinlogica buiten pages/API.
- **Lib:** auth, permissions, rateLimit, apiSecurity, stripe, prisma, metadata – centraal en herbruikbaar.

### Aanbevelingen
- Geen structurele wijzigingen nodig. Bij groei: overweeg feature-based mappen (bijv. `app/(marketing)/`, `app/(dashboard)/`) of behoud huidige structuur.

---

## CHECK 2 — Navigation & pages

### Bevindingen
- Alle navbar- en footerlinks verwijzen naar bestaande routes.
- Redirects: `/kennis` → `/kennisbank`, `/privacy-policy` → `/privacy`, `/pricing` → `/prijzen`, etc.
- Geen broken links in hoofdnavigatie.

### Aanbevelingen
- (Optioneel) `/register` → `/create-account` redirect voor één canonical registratie-URL.

---

## CHECK 3 — UI consistency

### Bevindingen
- **Design tokens:** Tailwind `marketing.*`, `gold`, `goldHover`, `slate` consistent in nieuwe pagina’s.
- **Kleuren:** Marketing light (#F8FAFC, #0F172A, #C6A95D) en dashboard dark gescheiden.
- **Schaduwen:** `marketing-card`, `marketing-card-hover`, `ds-card` gedefinieerd.

### Aanbevelingen
- Oudere componenten (Hero, Packages, FinalCta, Services, UpgradeModal) nog nalopen en waar nodig `btn-primary` / hardcoded gray vervangen door design-tokens.
- Eén keer alle marketing-pagina’s scannen op `text-gray-` en omzetten naar `text-marketing-text` / `text-marketing-textSecondary`.

---

## CHECK 4 — Performance

### Bevindingen
- **next/image** gebruikt in Navbar, Footer, dashboard.
- **next/font** (Inter) in layout.
- **Dynamic imports** voor o.a. FAQSection.
- **Static/ISR:** SEO-pagina’s statisch; kennisbank `revalidate = 3600`; rapporten met revalidate.
- **Health check:** 45s cache om DB-load te beperken.

### Aanbevelingen
- Bij 10k gebruikers: zware admin-lijsten (users, leads) pagineren of virtualiseren.
- Bundle-analyzer draaien om grote dependencies te vinden; waar nodig lazy load voor admin/dashboard.
- Overweeg Redis (of Upstash) voor rate limit store bij meerdere server instances (zie CHECK 12).

---

## CHECK 5 — Database

### Bevindingen
- **Prisma:** Modellen met duidelijke relaties; `@@index` op veelgebruikte velden (email, userId, createdAt, status, slug, etc.).
- **Article:** index op slug, category, publishedAt.
- **AuditReport:** index op leadId, createdAt, shareSlug.
- Geen N+1-patterns gezien in gelezen API-routes; `include`/`select` redelijk gericht.

### Aanbevelingen
- Bij zeer zware queries (bijv. admin control-center met veel joins): overweeg read replicas of materialized views.
- Migraties altijd op staging testen; bij grote tabellen migraties in batches uitvoeren.

---

## CHECK 6 — API security

### Bevindingen
- **Auth:** Beveiligde routes gebruiken `getCurrentUser()`, `requireOwner()`, `requireAdminOrOwner()` of expliciete role-check (bijv. convert-lead: admin/owner).
- **Rate limiting:** AI-routes (`rateLimitAi`), auth (`rateLimitAuth`), contact/newsletter (`rateLimitSensitive`), plans (`rateLimit`). Control-center en content-generator alleen voor admin/owner (geen publieke rate limit nodig).
- **Origin:** `validateOrigin()` op AI- en gevoelige publieke endpoints.
- **Input:** Sanitization (sanitizeString, sanitizeWebsiteUrl, validateEmailFormat) op relevante inputs.
- **Foutafhandeling:** `handleApiError` logt intern, geeft generieke boodschap in productie.

### Uitgevoerde fix
- **Stripe create-checkout-session:** Rate limiting toegevoegd (`rateLimitSensitive` per user+IP) om misbruik bij veel gelijktijdige gebruikers te beperken.

### Aanbevelingen
- Stripe customer-portal endpoint eveneens rate limiten (zelfde patroon als checkout).
- Gevoelige admin-endpoints blijven achter middleware + role check; extra rate limit voor admin (bijv. per user) is optioneel.

---

## CHECK 7 — Stripe & payments

### Bevindingen
- **Webhook:** Signature verification met `STRIPE_WEBHOOK_SECRET`; zonder geldige signature wordt request geweigerd.
- **Idempotency:** `ProcessedStripeEvent` voorkomt dubbele verwerking van dezelfde event-id.
- **Checkout:** Plan uit metadata/userId; priceId uit env (PRICE_IDS); geen client-stuurde prijzen.
- **Subscriptions:** checkout.session.completed, customer.subscription.updated/deleted correct afgehandeld; role en planId worden gezet.

### Aanbevelingen
- Blijven controleren dat geen payment-gerelateerde actie op client-input vertrouwt (alleen server-side priceId/env).
- (Optioneel) Webhook-retries en dead-letter logging (bijv. failed events naar een queue of log) voor observability.

---

## CHECK 8 — Shop system (hardware)

### Bevindingen
- **Cart:** Alleen client-side (localStorage `vdb-cart`); geen server-side cart of order-DB.
- **Checkout:** Toont alleen overzicht; geen Stripe Checkout voor hardware; tekst vermeldt dat volledige integratie nog nodig is.
- **Prijsmanipulatie:** Niet van toepassing zolang er geen server-side order met prijs uit cart wordt gecreëerd; bij echte shop later prijzen altijd server-side uit product-DB halen.

### Aanbevelingen
- Bij live hardware-verkoop: Order-model in Prisma; Stripe Checkout (of Payment Intents) met server-side line items; webhook voor payment success en order-update.
- Cart-validatie: bij submit server-side producten en prijzen ophalen en vergelijken met wat de client toont.

---

## CHECK 9 — SEO

### Bevindingen
- **Metadata:** Veel pagina’s gebruiken `pageMetadata()` (title, description, canonical, OG, Twitter).
- **Sitemap:** Dynamisch; statische routes, work, SEO-slugs, kennisbank-artikelen, juridische pagina’s.
- **Structured data:** SEO-pagina’s (Article, FAQ, Organization, WebSite); rapporten en kennisbank-artikelen (Article).
- **robots.txt:** Aanwezig; disallow /admin, /dashboard, /login, /register, /review/; sitemap gelinkt.

### Aanbevelingen
- (Optioneel) `/portal` toevoegen aan disallow als portal niet geïndexeerd moet worden.
- Nieuwe pagina’s standaard `pageMetadata` met `path` voor canonical.

---

## CHECK 10 — Accessibility

### Bevindingen
- **ARIA:** Navbar (aria-expanded, aria-label), ShareButtons (aria-label), Modal, ReportPublicClient, ControlCenterLive gebruiken aria- of role-achtige attributen.
- **Semantiek:** Article, nav, section, header/footer op veel plekken gebruikt.
- **Focus:** Tailwind focus ring op knoppen/inputs in meerdere componenten.

### Aanbevelingen
- Alle icon-only knoppen een `aria-label` geven.
- Skip-link “Naar inhoud” voor keyboard users overwegen.
- Contrast controleren (bijv. gold op wit) met een contrast-checker; design tokens voldoen in principe aan WCAG AA.

---

## CHECK 11 — Error handling

### Bevindingen
- **API:** `handleApiError` gebruikt; in productie geen stack/error-details naar client; logging wel.
- **Not found:** `notFound()` op dynamische routes (seo, kennisbank, report, platform, calculators, apparaten).
- **Validatie:** Ontbrekende of ongeldige body geeft 400 met duidelijke message op belangrijke endpoints.

### Aanbevelingen
- Bij kritieke flows (betaling, registratie) eventueel user-vriendelijke foutpagina’s (bijv. “Iets misgegaan – probeer opnieuw” met CTA).
- Global error boundary in App Router voor onverwachte runtime errors (optioneel).

---

## CHECK 12 — Production config

### Bevindingen
- **Env:** Geen secrets in client code; Stripe/OpenAI/DB alleen server-side.
- **Headers:** CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy in next.config.
- **Rate limits:** In-memory store; limieten gedefinieerd (AI 20/min, Auth 10/min, Sensitive 20/min, etc.).
- **Caching:** Health 45s; ISR/revalidate op statische/dynamische pagina’s.
- **Logging:** logger gebruikt; geen stack in productie-response.

### Aanbevelingen
- **Schaal (10k+ users, meerdere instances):** Rate limit store vervangen door Redis (bijv. Upstash); `setRateLimitStore()` bij startup aanroepen zodat limieten globaal zijn.
- **CSP:** Op termijn `'unsafe-inline'` / `'unsafe-eval'` voor scripts verminderen (bijv. nonces) voor strengere CSP.
- **Env checklist:** DATABASE_URL, DIRECT_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_*, SITE_URL, OWNER_EMAILS – documenteren in .env.example en deploy-docs.

---

## Critical issues

| # | Issue | Status |
|---|--------|--------|
| 1 | Stripe create-checkout-session zonder rate limit (misbruik bij veel users) | **Opgelost:** rate limit toegevoegd |

Geen andere critical issues gevonden.

---

## Medium issues

| # | Issue | Aanbeveling |
|---|--------|-------------|
| 1 | Rate limit store is in-memory | Bij meerdere instances Redis (Upstash) gebruiken |
| 2 | Hardware checkout nog geen echte betaling | Bij go-live shop: Order-model, Stripe Checkout, server-side prijzen |
| 3 | Enkele legacy UI-componenten niet op design tokens | Nalopen en omzetten naar marketing.* / gold |

---

## Minor improvements

| # | Item |
|---|------|
| 1 | Stripe customer-portal endpoint rate limiten |
| 2 | Redirect `/register` → `/create-account` voor één registratie-URL |
| 3 | robots.txt: overwegen `/portal` toe te voegen aan disallow |
| 4 | Skip-link en extra aria-labels voor accessibility |
| 5 | Bundle-analyzer draaien en grote dependencies beperken |
| 6 | Documentatie env vars en deployment (incl. rate limit Redis) |

---

## Simulatie: 10k users, 500 req/min, 100 AI/min

- **API:** Rate limits (20 AI/min per client, 60 general, etc.) beperken abuse; bij 500 req/min verdeeld over veel users blijven limieten per user/IP binnen redelijke marge.
- **Database:** Indexes op belangrijke velden; health check gecached – geen overbelasting door health alleen.
- **Stripe:** Webhook idempotent en signature-check; checkout nu ook rate limited.
- **Bottlenecks:** (1) In-memory rate limit deelt state niet tussen instances – bij horizontale schaling Redis nodig. (2) Zware admin-queries (control-center, userlijsten) bij zeer hoge load pagineren of cachen.

---

## Conclusie

Het platform is **geschikt voor productie** met de huidige scope. De toegevoegde rate limit op Stripe checkout en de aanbevelingen (Redis voor rate limit bij schaal, afronden hardware-checkout, UI-tokens, env-docs) maken het klaar voor groei naar 10k+ gebruikers. Voer voor een echte stress test loadtests uit (bijv. k6 of Artillery) tegen staging.
