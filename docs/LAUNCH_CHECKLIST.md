# VDB Digital – Launch Checklist (vanavond live)

Alleen wat **absoluut nodig is voor productie**. Volg in volgorde.

---

## 1. Kritische security

### Environment variables (Vercel)

**Verplicht:**

```
DATABASE_URL
DIRECT_URL

NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

STRIPE_PRICE_ID_STARTER
STRIPE_PRICE_ID_GROWTH
STRIPE_PRICE_ID_AGENCY

OPENAI_API_KEY

SITE_URL
```

**Optioneel:**

```
SUPABASE_SERVICE_ROLE_KEY
OWNER_EMAILS
POSTHOG_KEY
SENTRY_DSN
REDIS_URL
```

### CSP (next.config.mjs)

- Bevat: `js.stripe.com`, `api.stripe.com`, `stripe.com` (frame-src, script-src, connect-src, form-action).
- Status: **OK** in huidige config.

### Stripe webhook

- Route: `POST /api/stripe/webhook`
- Verplicht: `stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)` vóór verwerking.
- Status: **OK** in `app/api/stripe/webhook/route.ts`.
- In Stripe Dashboard: Webhook URL instellen op `https://<jouw-domein>/api/stripe/webhook`, events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.

---

## 2. Audit endpoint

**Bestand:** `app/api/ai/website-audit/route.ts`

**Flow:** 1. Origin check → 2. Rate limit → 3. Zod body → 4. Plan limit (ingelogd) → 5. Run audit → 6. Store (captureAuditLead) → 7. Return.

**Response:** Bevat `success`, `score` (overall), `scores`, `insights`, `recommendations`, plus bestaande velden.

Status: **OK**.

---

## 3. Rate limiting

- **Auth:** `rateLimitAuth` op `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/login-failed`, `/api/auth/register-preference`.
- **AI:** `rateLimitAi` op `/api/ai/website-audit` en overige AI-routes.
- **Stripe:** `rateLimitSensitive` op `/api/stripe/create-checkout-session`, `/api/stripe/customer-portal`.
- Webhook: geen rate limit (beveiligd via signature).

Status: **OK**.

---

## 4. Stripe checkout + webhook

**Flow:** `/prijzen` → upgrade → Stripe Checkout → success/cancel redirect → webhook ontvangt events.

**Webhook verwerkt:**

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Status: **OK** in `app/api/stripe/webhook/route.ts`.

---

## 5. Dashboard

**Routes:**

- `/dashboard` — overzicht
- `/dashboard/audits` — audits
- `/dashboard/billing` — abonnement, gebruik, upgrade
- `/dashboard/reports` — rapporten

User kan: audit starten (via /website-scan of tools), rapport zien, upgrade klikken (billing/prijzen).

Status: **OK**.

---

## 6. Gratis audit funnel

- **Landing:** `/gratis-website-scan` → redirect naar `/website-scan` (permanent).
- **Form:** URL + e-mail op `/website-scan` (WebsiteScanSection).
- **Flow:** Submit → audit → result preview → upgrade CTA (billing/prijzen).

Status: **OK** (redirect + sitemap entry toegevoegd).

---

## 7. SEO

- **Pagina’s:** `/prijzen`, `/kennisbank`, `/website-scan`, `/gratis-website-scan` (redirect).
- **Sitemap:** `/sitemap.xml` — bevat o.a. bovenstaande.
- **Robots:** `/robots.txt` — disallow /admin, /dashboard, /portal, /login, /register, /create-account, /review/.

Status: **OK**.

---

## 8. Error handling

- API-routes gebruiken `handleApiError()` uit `lib/apiSafeResponse` (try/catch, generieke 500, geen stack naar client).
- Status: **OK** voor audit, Stripe, auth.

---

## 9. Database

**Tabellen (Prisma):**

- **User** — auth, plan, Stripe-ids, auditCountCurrentMonth
- **Plan** — abonnementen (geen aparte Subscription-tabel; subscription state op User + Stripe)
- **Lead**, **AuditReport**, **AuditResult**
- **AuditHistory**
- **Article** (kennisbank)
- **ProcessedStripeEvent** (webhook idempotency)

**Voor launch:** `prisma migrate deploy` (of `migrate dev` lokaal) zodat alle tabellen bestaan.

---

## 10. Launch UI-check

- Logo: controleren op homepage/dashboard.
- Pricing: `/prijzen` werkt, link naar Stripe Checkout.
- Login: Supabase Auth op `/login`.
- Audit: `/website-scan` form + `/api/ai/website-audit`.
- Dashboard: na login `/dashboard`, `/dashboard/audits`, `/dashboard/billing`.
- Upgrade: vanuit billing of prijzen naar Stripe Checkout.

---

## Live-domein

Zet in Vercel (en .env):

- **SITE_URL:** `https://www.vdbdigital.nl`

Dan werken redirects, Stripe success/cancel URLs en e-mails correct.

---

## Google Search Console (na launch)

Submit sitemap in Google Search Console:

```
https://www.vdbdigital.nl/sitemap.xml
```

## Eerste traffic (LinkedIn)

Plaats bijvoorbeeld:

```
Ik heb een AI tool gebouwd die websites analyseert
en laat zien waarom ze geen klanten opleveren.

Je krijgt direct:
- SEO analyse
- snelheid analyse
- conversie verbeterpunten

Gratis te testen:
https://www.vdbdigital.nl/website-scan
```

## Bonus (na launch)

- Redis + BullMQ (queue)
- Sentry
- PostHog
- Uitbreiding admin-dashboard

---

## Cursor-review prompt

Gebruik in Cursor:

```
Review the entire VDB Digital project for production readiness.
Context: docs/AI_CONTEXT.md.
Check: security, Stripe integration, API routes, Prisma schema,
environment variables, audit endpoint stability, Next.js configuration.
Return: 1 critical issues 2 fixes 3 production improvements
```
