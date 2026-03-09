# VDB Digital — Uitleg voor Gemini

Dit document legt de codebase uit zodat Gemini (of andere AI-assistenten) het project goed begrijpt en correct kan bewerken.

---

## 1. Wat is VDB Digital?

**VDB Digital** is een SaaS-platform voor AI-website-audits en conversie-optimalisatie. Gebruikers kunnen:

- Hun website gratis scannen
- Een AI-auditrapport krijgen (SEO, performance, UX, conversie)
- Abonnementen afnemen via Stripe
- Tools gebruiken (SEO keyword finder, conversion analyzer, etc.)
- Rapporten en projecten beheren in een dashboard

---

## 2. Tech stack

| Onderdeel | Technologie |
|-----------|-------------|
| Framework | Next.js 16 (App Router) |
| Taal | TypeScript |
| Database | PostgreSQL via Prisma |
| Auth | Supabase Auth |
| Betalingen | Stripe |
| AI | OpenAI (gpt-4o-mini voor audit-teksten) |
| Cache/Queue | Redis + BullMQ (optioneel) |
| Styling | Tailwind CSS |
| Animaties | Framer Motion |

---

## 3. Projectstructuur

```
vdb-digital/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Homepage
│   ├── layout.tsx          # Root layout (fonts, providers)
│   ├── api/                # API-routes
│   ├── dashboard/          # Gebruikersdashboard
│   ├── admin/              # Admin-panel
│   ├── tools/              # AI-tools (website-audit, seo-keyword-finder, etc.)
│   ├── prijzen/            # Pricing
│   └── ...
├── components/             # React-componenten
│   ├── home/               # Homepage-secties
│   ├── dashboard/         # Dashboard-UI
│   ├── ui/                 # Herbruikbare UI (Button, Modal, etc.)
│   └── ...
├── lib/                    # Kernlogica
│   ├── auth.ts             # Supabase auth, requireUser
│   ├── prisma.ts           # Prisma client
│   ├── redis.ts            # Redis client (optioneel)
│   ├── cache.ts            # getOrSet, Redis/memory cache
│   ├── rateLimit.ts        # Rate limiting
│   ├── ai-website-audit.ts # Audit-facade (crawl → scores → AI)
│   ├── plans.ts            # Abonnementen, getActivePlans
│   └── ...
├── modules/                # Domeinmodules
│   ├── audit/              # Crawler, scoring, queue, worker
│   ├── leads/              # Lead capture (auditLead)
│   └── ...
├── prisma/
│   ├── schema.prisma       # Database-schema
│   └── migrations/
└── middleware.ts           # Edge middleware (headers, cache hints)
```

---

## 4. Belangrijke modules

### 4.1 Audit-engine (`lib/ai-website-audit.ts`, `modules/audit/`)

**Flow:**
1. **URL normaliseren** — `normalizeUrlForCache()` voor consistente cache-keys
2. **Cache check** — Redis (L1) → AuditCache DB (L2) → bij hit direct return
3. **Crawl** — `collectSignals()` haalt HTML op, Cheerio parst titel, meta, h1, links, etc.
4. **Scores** — Deterministische regels (geen AI): SEO, performance, UX, conversie
5. **AI** — Alleen voor samenvatting/advies (OpenAI)
6. **Opslaan** — AuditCache (DB) + Redis

**Belangrijk:** Scores komen nooit uit AI; dezelfde input geeft altijd dezelfde scores.

### 4.2 API-routes

| Route | Methode | Doel |
|-------|---------|------|
| `/api/ai/website-audit` | POST | Start website-scan (rate limit, Zod, plan limit) |
| `/api/ai/website-audit/status` | GET | Poll job-status (bij useQueue) |
| `/api/plans` | GET | Actieve abonnementen (gecached) |
| `/api/auth/me` | GET | Huidige gebruiker |
| `/api/stripe/create-checkout-session` | POST | Stripe checkout |
| `/api/stripe/webhook` | POST | Stripe events (signature + idempotency) |

**Conventies:**
- Origin-check op publieke APIs
- Rate limiting (auth, AI, audit)
- Zod voor request body validatie
- `handleApiError()` voor foutafhandeling

### 4.3 Caching (`lib/cache.ts`, `lib/redis.ts`)

- **getOrSet(key, fn, ttlMs)** — Cache-aside: eerst cache, anders fn() uitvoeren en resultaat cachen
- **Redis** — Als `REDIS_URL` is gezet; anders in-memory
- **Dashboard** — 45s TTL via `dashboardCacheKey(userId)`
- **Audit** — 24h (Redis L1 + AuditCache DB)

### 4.4 Rate limiting (`lib/rateLimit.ts`)

- In-memory standaard; Redis-adapter voor multi-instance
- `rateLimit()` — Algemeen (60/min)
- `rateLimitAuth()` — Login (10/min)
- `rateLimitAi()` — AI-routes (20/min)
- `rateLimitAuditPerHour()` — 10 scans/uur per IP
- `getClientKey(request)` — IP uit x-forwarded-for of x-real-ip

---

## 5. Database (Prisma)

**Kernmodellen:**
- **User** — id (Supabase), email, role, planId, stripeCustomerId, auditCountCurrentMonth
- **Plan** — name, price, credits, features (JSON)
- **Lead** — email, name, company, website, source
- **AuditReport** — leadId, url, seoScore, perfScore, uxScore, convScore, summary
- **AuditCache** — url (unique), score, result (JSON), 24h cache
- **PublicAudit** — domain (unique), voor /audit/[domain]

**Conventies:**
- Gebruik `select` om alleen benodigde kolommen op te halen
- Indexen op veelgebruikte velden (email, leadId, createdAt)
- Composite index `[leadId, createdAt]` voor dashboard-queries

---

## 6. Frontend-conventies

- **Server Components** — Standaard; geen "use client" tenzij nodig
- **Client Components** — Voor state, useEffect, event handlers
- **Dynamic imports** — Voor below-the-fold secties: `dynamic(() => import(...), { ssr: true })`
- **Next.js Image** — Altijd met `sizes` en `priority` voor hero-images
- **Framer Motion** — `optimizePackageImports` in next.config voor kleinere bundle

---

## 7. Performance-optimalisaties

- **Static pages** — `/privacy`, `/voorwaarden`, `/cookies`, `/disclaimer` met `force-static`
- **Middleware** — Edge; cache hints voor /seo/*, /tools/*
- **Plans API** — Cache-Control: s-maxage=300, stale-while-revalidate=600
- **Dashboard** — getOrSet met 45s, skeleton loading voor UsageDashboard
- **Audit** — Redis L1 vóór DB voor snelle cache-hits

---

## 8. Security

- CSP, X-Frame-Options, HSTS in next.config
- CSRF op mutating admin-routes
- Zod op alle request bodies
- Stripe webhook signature + ProcessedStripeEvent voor idempotency
- `requireUser`, `requireAdminOrOwner`, `requireOwner` op beschermde routes

---

## 9. Environment variables

| Variabele | Verplicht | Doel |
|-----------|-----------|------|
| DATABASE_URL | Ja | Prisma |
| DIRECT_URL | Ja | Prisma migrations |
| NEXT_PUBLIC_SUPABASE_URL | Ja | Auth |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Ja | Auth |
| STRIPE_SECRET_KEY | Ja | Betalingen |
| STRIPE_WEBHOOK_SECRET | Ja | Webhooks |
| OPENAI_API_KEY | Ja | Audit-samenvatting |
| SITE_URL | Ja | Origin check, emails |
| REDIS_URL | Nee | Cache, rate limit, queue |

---

## 10. Tips voor Gemini

1. **Audit aanpassen** — Begin in `lib/ai-website-audit.ts` of `modules/audit/run-scan.ts`
2. **Nieuwe API** — Volg bestaande routes: origin, rate limit, Zod, handleApiError
3. **Database** — Voeg indexen toe voor nieuwe query-patterns
4. **UI** — Gebruik bestaande `components/ui` (Button, Modal, etc.)
5. **i18n** — `getTranslations("nl")` en `useTranslations()` voor teksten
6. **Nieuwe pagina** — Check of `force-static` of `revalidate` past
