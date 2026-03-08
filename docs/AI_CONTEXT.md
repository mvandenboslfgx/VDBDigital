# VDB Digital — AI Context (voor architect/code review)

## Project
AI Website Audit & Conversion Optimization SaaS. Gebruikers scannen hun site, krijgen een AI-auditrapport, verbeteradviezen, projecten en rapporten; abonnementen via Stripe.

## Stack
- Next.js 16 (App Router)
- TypeScript
- Prisma + PostgreSQL
- Supabase Auth
- Stripe (subscriptions)
- OpenAI (audit-uitleg)
- Redis (optioneel: rate limit, queue)
- BullMQ (audit queue)
- Tailwind, Framer Motion

## Projectstructuur
- `/app` — routes, pages, API
- `/lib` — auth, stripe, validation, rateLimit, csrf, plans, audit-limits, redis
- `/modules` — audit (crawler, scoring, insights, queue), leads (auditLead)
- `/prisma` — schema, migrations, seed
- `/components` — UI, dashboard, report, admin
- `/docs` — audit, checklist, AI_CONTEXT

## Database (kern)
- **User** — Supabase id, email, role, planId, stripeCustomerId, stripeSubscriptionId, auditCountCurrentMonth, lastAuditResetAt
- **Plan** — name, price, credits, features JSON
- **Lead**, **AuditReport**, **AuditResult** — lead capture + rapporten
- **AuditHistory**, **WebsiteProject** — per user
- **UsageEvent**, **AIUsage**, **AuditLog**
- **ProcessedStripeEvent** — webhook idempotency
- **Article** — kennisbank

## API-routes (kern)
- `POST /api/ai/website-audit` — scan (origin, rate limit, Zod, plan limit, queue optie)
- `POST /api/stripe/webhook` — Stripe events (signature + idempotency)
- `POST /api/stripe/create-checkout-session` — checkout (Zod plan)
- `POST /api/stripe/customer-portal` — portal (CSRF, rate limit)
- `GET /api/auth/me` — current user/role
- Admin: `/api/admin/leads`, projects, invoices, etc. (requireAdminOrOwner / requireOwner)

## Env (productie)
- `DATABASE_URL`, `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_STARTER` / `_GROWTH` / `_AGENCY`
- `OPENAI_API_KEY`, `SITE_URL`, `OWNER_EMAILS`
- Optioneel: `REDIS_URL`, `SENTRY_DSN`, `POSTHOG`

## Architectuur (audit engine)
- **Optie B:** URL → crawl (`collectSignals`) → SEO + performance (PageSpeed) → deterministic score engine → AI alleen voor teksten.
- Scores nooit uit AI; zelfde input → zelfde scores.

## Security (verplicht)
- CSP, X-Frame-Options, HSTS, Referrer-Policy
- CSRF (`lib/csrf`) op mutating routes
- Rate limiting (auth, AI, Stripe, audit); Redis voor multi-instance
- Zod op alle mutating request bodies
- Stripe webhook signature + idempotency
- Auth middleware + requireUser / requireOwner op beschermde routes

## Plannen
- **Gratis:** 1 audit/maand
- **Starter:** 10, **Pro:** 50, **Agency:** ∞ (`lib/plans.ts`, `lib/audit-limits.ts`)
