# VDB Digital – Technische roadmap

**Prioriteit:** security → performance → SEO → UX → schaalbaarheid.  
**Doel:** platform production-hard en schaalbaar maken voor 10k+ gebruikers.

---

## 1. Security (hoogste prioriteit)

| # | Actie | Impact | Effort |
|---|--------|--------|--------|
| 1.1 | **Rate limit store naar Redis (Upstash)** bij meerdere server instances, zodat limieten globaal zijn en niet per instance. | Voorkomt abuse bij horizontale schaling. | Medium |
| 1.2 | **Stripe customer-portal** endpoint rate limiten (zelfde patroon als create-checkout-session). | Beperkt misbruik. | Laag |
| 1.3 | **CSP aanscherpen:** `unsafe-inline` / `unsafe-eval` verminderen; waar mogelijk nonces voor scripts. | Sterkere XSS-bescherming. | Medium |
| 1.4 | **Webhook & gevoelige API’s:** documenteren welke env vars (o.a. STRIPE_WEBHOOK_SECRET) verplicht zijn; geen secrets in client. | Duidelijke security baseline. | Laag |
| 1.5 | (Optioneel) **Admin API’s** extra rate limit per user (naast bestaande auth). | Beperkt impact bij gecompromitteerd admin-account. | Laag |

---

## 2. Performance

| # | Actie | Impact | Effort |
|---|--------|--------|--------|
| 2.1 | **Bundle-analyzer** draaien; grote dependencies identificeren en waar nodig lazy loaden (bijv. admin/dashboard). | Kleinere initial load, snellere TTI. | Laag |
| 2.2 | **Admin/dashboard:** zware tabellen (users, leads) **paginatie** of virtualisatie. | Schaal bij veel data. | Medium |
| 2.3 | **Images:** alle marketing-assets via `next/image` met passende `sizes`; waar mogelijk WebP/AVIF. | Betere LCP en bandwidth. | Laag |
| 2.4 | **Control-center / live data:** bij zeer hoge load overwegen korte cache (bijv. 30s) of read replica voor alleen-lezen queries. | Minder DB-load. | Medium |

---

## 3. SEO

| # | Actie | Impact | Effort |
|---|--------|--------|--------|
| 3.1 | **Nieuwe pagina’s standaard** `pageMetadata()` met canonical `path`; Open Graph + Twitter consistent. | Geen duplicate content, betere sharing. | Laag |
| 3.2 | **robots.txt:** overwegen `/portal` toe te voegen aan disallow indien niet bedoeld voor indexatie. | Duidelijke crawl-instructies. | Laag |
| 3.3 | **Interne links:** bij nieuwe content (artikelen, tools) standaard links naar /website-scan, /tools, /kennisbank. | Sterkere site-structuur. | Laag |
| 3.4 | (Optioneel) **Structured data** uitbreiden waar relevant (bijv. BreadcrumbList op categoriepagina’s). | Rijkere zoekresultaten. | Laag |

---

## 4. UX

| # | Actie | Impact | Effort |
|---|--------|--------|--------|
| 4.1 | **Design system consistent maken:** alle marketing-componenten op tokens (marketing.*, gold); oude `btn-primary` / gray vervangen. | Eenduidige look & feel. | Medium |
| 4.2 | **Registratie-URL:** één canonical (bijv. `/create-account`); redirect `/register` → `/create-account`. | Minder verwarring, betere analytics. | Laag |
| 4.3 | **Toegankelijkheid:** skip-link “Naar inhoud”; alle icon-only knoppen `aria-label`; contrast (goud op wit) controleren. | WCAG-compliance, betere gebruikservaring. | Laag |
| 4.4 | **Foutpagina’s:** duidelijke, vriendelijke foutpagina’s voor kritieke flows (betaling, registratie) met CTA. | Minder frustratie bij fouten. | Laag |

---

## 5. Schaalbaarheid

| # | Actie | Impact | Effort |
|---|--------|--------|--------|
| 5.1 | **Redis (Upstash)** voor rate limit + optioneel sessie/cache; `setRateLimitStore()` bij startup. | Schaal over meerdere instances. | Medium |
| 5.2 | **Hardware shop:** bij go-live Order-model, Stripe Checkout met server-side line items, webhook voor betaling; cart/prijzen server-side valideren. | Veilige, schaalbare webshop. | Hoog |
| 5.3 | **Database:** bij zeer zware admin-queries overwegen read replica of materialized views; migraties in batches bij grote tabellen. | Stabiliteit onder load. | Medium |
| 5.4 | **Logging & monitoring:** gestructureerde logs; alerts op errors en rate-limit triggers; optioneel APM (bijv. Vercel Analytics of externe tool). | Snel problemen detecteren. | Medium |

---

## Voorgestelde volgorde (kwartalen)

- **Q1 (nu):** 1.2, 1.4, 2.1, 3.1, 3.2, 4.2, 4.3 (snelle wins).
- **Q2:** 1.1 (Redis), 2.2, 4.1 (design tokens), 5.4 (logging).
- **Q3:** 1.3 (CSP), 2.4 (control-center), 5.1 (Redis uitbreiden), 5.2 (shop afronden).
- **Q4:** 3.4, 5.3 naar behoefte; verdere optimalisatie op basis van metingen.

---

Dit document kan worden gekoppeld aan issues (GitHub/Linear) en bij elke release geüpdatet.
