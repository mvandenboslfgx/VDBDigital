# VDB Digital — SaaS Architectuur

Enterprise-grade SaaS foundation voor AI tools, business calculators, agency-diensten, abonnementen, klantportalen en admin. Stack: **Next.js + Supabase + Stripe + AI + Prisma**.

---

## 1. Modules architecture

Feature-oriented code lives in **`modules/`**. Each module owns one domain and is the single place for that logic; the rest of the app (dashboard, API routes) imports from modules only where applicable.

| Module | Purpose | Entry |
|--------|---------|--------|
| **calculators** | Business calculators (ROI, break-even, pricing, discount, price increase, subscription vs one-time, freelancer rate, finance check). Pure functions + types. | `@/modules/calculators` |
| **ai** | AI product layer: marketing strategy, landing page copy, SEO audit. Uses `lib/openai` and `lib/usage` (incrementAiUsage). | `@/modules/ai` |
| **leads** | Lead capture from website audits: create/update Lead, AuditReport, optional LeadScore/AuditHistory. | `modules/leads/auditLead` |
| **email** | Transactional email: welcome, upgrade confirmation, audit report. Wraps `lib/email` / SMTP. | `@/modules/email` |

Dashboard and API routes call modules; business rules and formulas stay inside modules. Shared infra (auth, DB, Stripe, rate limits) stays in **`lib/`**.

---

## 2. API structure

- **Auth:** `api/auth/*` — me, login, register, register-preference, login-failed, check-lockout, health, logout. Role from DB; middleware protects `/dashboard`, `/portal`, `/admin`.
- **AI:** `api/ai/*` — website-audit, audit, copy, marketing-strategy, landing-page, seo-audit, builder, funnel-generator, competitor-analyzer. Origin check, rate limit, `canUseAiTools(user)`.
- **Stripe:** `api/stripe/*` — create-checkout-session, customer-portal, webhook (signature + idempotency).
- **Calculators:** `api/calculators/record` — POST body validated with Zod; records usage and audit in background.
- **Admin:** `api/admin/*` — all require `requireUser("admin")`; used by admin UI only.
- **Other:** plans, contact (Zod), notifications, onboarding, reports, analytics, portal.

**Validation:** `lib/validation.ts` uses **Zod**. Routes use `safeParse(schema, body)` and return 400 with error messages on failure. Schemas: contact, calculator record, URL, marketing/landing/SEO bodies.

**Error handling:** `handleApiError(error, context)` logs via `logger.logError` and returns a generic 500 to the client in production.

---

## 3. SaaS billing flow

1. **Plans:** Defined in `lib/plans.ts` (Starter, Pro, Agency) and in DB `Plan` (prices, Stripe price IDs). Feature flags and limits (AI, calculators, projects) come from plan config.
2. **Checkout:** User clicks upgrade → `api/stripe/create-checkout-session` → redirect to Stripe Checkout (metadata: userId).
3. **Webhook:** On `checkout.session.completed` and `customer.subscription.updated`, webhook updates `User.planId`, `User.role` (pro/customer), `stripeCustomerId`, `stripeSubscriptionId`. On `customer.subscription.deleted`, user is set back to free plan and role `lead`. Idempotency via `ProcessedStripeEvent`.
4. **Usage:** `lib/usage.ts` — `getUsage(userId)`, `checkUsageLimit(userId)`, `incrementAiUsage(userId, tool)`. Calculator usage = count of `CalculatorResult`; AI usage = count of `AIUsage` this month. Dashboard billing page shows current plan, usage vs limits, and link to Stripe Customer Portal.
5. **Feature gating:** `lib/features.ts` — `canUseAiTools(user)`, `canUseCalculators(user)`, etc., based on plan. Used by dashboard and API routes.

---

## 4. AI tools layer

- **Modules:** `modules/ai/` — marketingStrategy, landingPage, seoAudit. Each exports a `generate*` function; calls OpenAI and then `incrementAiUsage(userId, toolName)` (non-blocking).
- **API routes:** Each tool has a POST route under `api/ai/*`. Routes validate origin, apply AI rate limit, require `canUseAiTools(user)`, then call the module. Errors go through `handleApiError`.
- **Dashboard:** `/dashboard/ai-tools` — shows Quick tools (AIToolsPanel: marketing, landing, SEO) and links to other AI tools. Shown only when `canUseAiTools(dbUser)`.
- **Legacy/other:** website-audit, copy, audit, builder, funnel-generator, competitor-analyzer remain in place; new product tools live in `modules/ai` and follow the same pattern.

---

## 5. Core architectuur (overview)

```
VDB Digital SaaS
│
├── Frontend
│   ├── Next.js App Router
│   ├── Tailwind CSS
│   ├── Eigen design system (glass panels, gold accent)
│   └── React Server Components
│
├── Backend
│   ├── Next.js API routes
│   ├── Supabase Auth
│   ├── Prisma ORM
│   └── PostgreSQL
│
├── AI Engine
│   ├── AI website audit
│   ├── AI copy generator
│   ├── SEO/UX/conversie-scores
│   └── Rapport-generatie (Nederlands)
│
├── Payments
│   ├── Stripe subscriptions (Pro €29, Agency €299)
│   ├── Stripe Checkout
│   └── Stripe webhooks (met idempotency)
│
├── Security
│   ├── Middleware auth (dashboard/portal/admin)
│   ├── Role-based access (lead, pro, customer, admin)
│   ├── Rate limiting (auth/AI/sensitive/general)
│   ├── CSRF + Origin/Referer
│   ├── Login lockout (5 pogingen → 15 min)
│   └── Turnstile (optioneel, contact)
│
└── Admin
    ├── Users, leads, clients
    ├── Projects, invoices, websites
    ├── Newsletter, maintenance, analytics
    └── AI usage, content, packages
```

**Status:** Geïmplementeerd; security recent gehardened.

---

## 6. Frontend stack

| Onderdeel        | Blueprint      | Huidige staat                          |
|------------------|----------------|----------------------------------------|
| Framework        | Next.js 15     | Next.js (latest, App Router)          |
| UI               | Tailwind + Shadcn + Radix | Tailwind + eigen components      |
| Animatie         | Framer Motion  | Framer Motion                         |
| SEO              | Next SEO, schema | Metadata in layout/pages, sitemap, robots |

**Mogelijke uitbreiding:** Shadcn/Radix voor meer herbruikbare toegankelijke componenten.

---

## 7. Authenticatie (Supabase)

| Feature           | Blueprint     | Huidige staat                    |
|-------------------|---------------|-----------------------------------|
| E-mail + wachtwoord | ✓           | ✓                                |
| Magic link        | ✓           | Via Supabase mogelijk, niet in UI |
| OAuth (Google/LinkedIn) | ✓   | Niet geïntegreerd                |
| JWT cookies       | ✓           | ✓ (Supabase SSR)                 |
| Server-side check | ✓           | ✓ `getUser()` in middleware/API  |
| E-mailverificatie | ✓          | Supabase-optie; niet afgedwongen |
| Rollen            | admin, user, owner | lead, pro, customer, admin |
| Login lockout     | —            | ✓ 5 mislukte pogingen → 15 min   |

**Eigen logica:** Eerste user of `OWNER_EMAILS` → admin; overige nieuwe users → lead.

---

## 8. User dashboard

**Route:** `/dashboard`

| Onderdeel        | Status |
|------------------|--------|
| AI website audit | ✓ `/dashboard/audits`, API `ai/website-audit` |
| AI copy generator| ✓ `/dashboard/ai-tools`, API `ai/copy` |
| Rapporten        | ✓ `/dashboard/reports`, PDF-export |
| Calculators      | ✓ `/dashboard/calculators`, types in schema (roi, breakEven, etc.) |
| Projecten        | ✓ `/dashboard/projects` |
| Instellingen     | ✓ `/dashboard/settings` (newsletter, plan) |

---

## 9. Business calculator engine

**API:** `/api/calculators/record`

Calculator-types in Prisma: `roi`, `breakEven`, `priceIncrease`, `subscriptionVsOneTime`, `freelancerRate`, `discountImpact`, `financeCheck`.

Formules (conceptueel):

- **ROI:** `(winst - investering) / investering`
- **Break-even:** `vaste_kosten / (prijs - variabele_kosten)`
- **Pricing:** prijs, conversie, omzet-effect
- Overige: zie modules/logica voor calculators

**Status:** Recording en types aanwezig; formules in bestaande calculator-logica.

---

## 10. AI-tools (detail)

**Base route:** `/api/ai/*`

| Tool              | Route                    | Status |
|-------------------|--------------------------|--------|
| Website audit     | `ai/website-audit`       | ✓ Scores, rapport NL, prompt-injection check |
| Audit (legacy)    | `ai/audit`               | ✓ |
| Copy generator    | `ai/copy`                | ✓ |
| Funnel generator  | `ai/funnel-generator`    | ✓ |
| Builder           | `ai/builder`             | ✓ |
| Competitor analyzer | `ai/competitor-analyzer` | ✓ |

Input/output: o.a. website-URL, e-mail; scores (SEO, performance, UX, conversie), aanbevelingen, groeikans. Rate limit: 20/min (AI).

---

## 11. Stripe (detail)

| Feature        | Blueprint | Huidige staat |
|----------------|-----------|----------------|
| Plans          | Free, Pro, Agency | ✓ Gratis, Pro €29, Agency €299 |
| Checkout       | ✓         | ✓ `/api/stripe/create-checkout-session` |
| Webhooks       | ✓         | ✓ Signature + idempotency (`ProcessedStripeEvent`) |
| Customer portal| ✓         | ✓ `/api/stripe/customer-portal` (POST → Stripe Billing Portal URL) |

Prijzen in blueprint (Pro €29, Agency €79) vs. huidige (Pro €29, Agency €299): documenteer gewenste prijzen in product/pricing.

---

## 12. Admin dashboard

**Route:** `/admin`

| Onderdeel        | Route/API              | Status |
|------------------|------------------------|--------|
| Users            | `/admin/users`         | ✓ |
| Leads            | `/admin/leads`, `api/admin/leads` | ✓ |
| Clients          | `/admin/clients`       | ✓ |
| Projects         | `/admin/projects`      | ✓ |
| Invoices         | `/admin/invoices`      | ✓ |
| Websites         | `/admin/websites`      | ✓ |
| Newsletter       | `/admin/newsletter`    | ✓ |
| Maintenance      | `/admin/maintenance`   | ✓ |
| Analytics        | `/admin/analytics`     | ✓ |
| AI usage         | `/admin/ai-usage`      | ✓ |
| Content          | `/admin/content`       | ✓ |
| Packages         | `/admin/packages`      | ✓ |
| Settings         | `/admin/settings`      | ✓ |

Toegang: alleen `role === "admin"`; niet-admin → redirect + security log.

---

## 13. Analytics

| Blueprint        | Huidige staat |
|------------------|----------------|
| Plausible/PostHog | Niet geïntegreerd |
| Stripe revenue   | Via Stripe Dashboard / webhooks |
| Events           | ✓ `AnalyticsEvent`, `UsageEvent` in DB |
| Admin analytics  | ✓ `/admin/analytics` |

**Mogelijke uitbreiding:** Plausible of PostHog voor product analytics; MRR/ARR uit Stripe of eigen aggregatie.

---

## 10. Security

| Onderdeel        | Status |
|------------------|--------|
| OWASP-top 10     | Input validation, CSRF, safe errors, rate limit, auth lockout |
| Origin/Referer   | ✓ `validateOrigin`, `validateCsrf` |
| Rate limiting    | ✓ Auth 10/min, AI 20/min, sensitive 20/min, general 60/min |
| Bot protection   | ✓ Turnstile (optioneel, contact) |
| Headers          | ✓ CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| Geen stack traces| ✓ `handleApiError` / `safeJsonError` in productie |
| Input validation  | ✓ Zod in `lib/validation.ts`; contact, calculator record, AI bodies |

**Optioneel:** Redis (bijv. Upstash) voor gedistribueerde rate limits bij meerdere instances.

---

## 15. Performance

| Onderdeel           | Status |
|---------------------|--------|
| React Server Components | ✓ waar van toepassing |
| Dynamic imports      | ✓ lazy loading o.a. homepage-secties |
| Image optimization   | ✓ Next.js Image |
| Edge/caching         | Via deployment (Vercel/etc.) |
| In-memory cache     | ✓ `lib/cache.ts` — dashboard analytics, admin metrics, health (45s TTL). Reduces DB load. |
| Error boundaries    | ✓ `dashboard/error.tsx`, `dashboard/ai-tools/error.tsx`, `dashboard/calculators/error.tsx` — user-friendly fallback + retry. |

Doel Lighthouse 95+: meten en optimaliseren per pagina.

---

## 16. Mapstructuur (huidig)

```
app/
├── admin/           # Admin dashboard (layout + pages)
├── api/
│   ├── auth/        # me, login, register, register-preference, login-failed, check-lockout, health, logout
│   ├── ai/          # website-audit, audit, copy, builder, funnel-generator, competitor-analyzer
│   ├── stripe/      # create-checkout-session, webhook
│   ├── calculators/ # record
│   ├── analytics/   # event, visit
│   ├── admin/       # leads, clients, projects, invoices, newsletter, maintenance, etc.
│   ├── portal/      # settings/newsletter, support
│   ├── reports/     # audit-pdf
│   ├── plans/
│   └── contact
├── dashboard/       # Hoofddashboard, audits, reports, calculators, ai-tools, projects, settings
├── login, register, create-account, reset-password
├── pricing, contact, about, services
├── portal/          # Klantportal (files, projects, invoices, review, support, settings)
└── (overige: work, reviews, legal, privacy, cookie, …)

lib/
├── auth.ts          # getCurrentUser, requireUser, getOwnerEmails
├── rateLimit.ts     # Rate limits + login lockout
├── apiSecurity.ts   # validateOrigin, sanitize*, validateEmailFormat, containsPromptInjection
├── apiSafeResponse.ts
├── csrf.ts
├── turnstile.ts
├── safeRedirect.ts
├── logger.ts
├── ai-website-audit.ts
├── openai.ts, ai/usage.ts
├── plans.ts, audit-limits.ts, usage-events.ts
├── calculators/record.ts
├── cache.ts          # In-memory short TTL (dashboard, admin metrics, health)
├── validation.ts     # Zod schemas for API bodies
├── runInBackground.ts # Non-blocking audit/email
├── supabase/        # server, client
├── prisma.ts, mailer.ts, email.ts, env.ts
└── (overige: metadata, parse-report-sections, crm, company, newsletter)
```

---

## 17. Marketingwebsite

| Pagina   | Route      | Status |
|----------|------------|--------|
| Home     | `/`        | ✓ Hero, scan, features, pricing, CTA |
| Pricing  | `/pricing` | ✓ |
| Contact  | `/contact` | ✓ |
| Features | —          | Onderdeel van home of aparte /features |
| Tools    | `/calculators`, `/ai-website-audit` e.d. | ✓ (veel redirect naar /#scan) |
| About    | `/about`   | ✓ |
| Services | `/services`| ✓ |
| Blog     | —          | Niet aanwezig |

---

## 18. Groei & SEO

- **Gratis tools:** Website scan (preview), calculators, AI-audit achter inlog/limiet.
- **Lead flow:** Bezoeker → scan → preview → account → volledig rapport → upgrade.
- **SEO:** Metadata, sitemap, robots; content in het Nederlands.

---

## 19. Monetisatie

1. **SaaS-abonnementen:** Gratis, Pro, Agency (Stripe).
2. **Agency-upsell:** Agency-plan en portal voor grotere klanten.
3. **AI-credits/limieten:** Maandelijkse audit-limiet per plan.
4. **Consulting:** Via contact/lead-flow (geen aparte module in dit doc).

---

## Volgende stappen (optioneel)

| Prioriteit | Actie |
|------------|--------|
| Medium     | **OAuth:** Google (en eventueel LinkedIn) in Supabase toevoegen en in login/register aanbieden. |
| Medium     | **Shadcn/Radix:** Toevoegen voor forms/tables/modals waar toegankelijkheid en consistentie belangrijk zijn. |
| Laag       | **Analytics:** Plausible of PostHog voor product analytics. |
| Laag       | **Blog:** Route en content-model als SEO/groei gewenst is. |
| Laag       | **Redis rate limiting:** Upstash (of andere Redis) voor multi-instance rate limits. |

---

*Laatste update: na security hardening en blueprint-alignment. Dit document dient als single source of truth voor de VDB Digital SaaS-architectuur.*
