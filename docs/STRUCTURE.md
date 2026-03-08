# VDB Digital — Project Structure

**Stack:** Next.js 15 (App Router), TypeScript, Supabase Auth, Prisma ORM, PostgreSQL, Stripe, TailwindCSS, AI endpoints, rate limiting, enterprise security.

---

## Root structure

```
vdb-digital/
├── app/
├── components/
├── lib/
├── prisma/
├── public/
├── styles/
├── types/
├── middleware.ts
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env
```

---

## App Router

### Marketing (public)

| Route        | File                    | Notes                    |
|-------------|-------------------------|--------------------------|
| `/`         | `app/page.tsx`          | Home (hero, scan, CTA)   |
| `/pricing`  | `app/pricing/page.tsx`  | Prijzen                  |
| `/tools`    | `app/tools/page.tsx`    | Overzicht tools → scan   |
| `/blog`     | `app/blog/page.tsx`     | Placeholder / toekomst   |
| `/contact`  | `app/contact/page.tsx`  | Contactformulier         |

Optioneel: route group `app/(marketing)/` voor gedeelde layout (navbar/footer).

### Auth

| Route              | File                          |
|--------------------|--------------------------------|
| `/login`           | `app/login/page.tsx`          |
| `/register`        | `app/register/page.tsx`       |
| `/create-account`  | `app/create-account/page.tsx` |
| `/reset-password`  | `app/reset-password/page.tsx` |

### Dashboard

| Route                    | File                             |
|--------------------------|----------------------------------|
| `/dashboard`             | `app/dashboard/layout.tsx`, `page.tsx` |
| `/dashboard/ai-tools`    | `app/dashboard/ai-tools/page.tsx` |
| `/dashboard/calculators` | `app/dashboard/calculators/page.tsx` |
| `/dashboard/billing`     | `app/dashboard/billing/page.tsx` → settings/portal |
| `/dashboard/settings`   | `app/dashboard/settings/page.tsx` |
| `/dashboard/audits`      | `app/dashboard/audits/page.tsx` |
| `/dashboard/reports`     | `app/dashboard/reports/page.tsx` |
| `/dashboard/projects`    | `app/dashboard/projects/page.tsx` |

### Admin

| Route              | File                         |
|--------------------|------------------------------|
| `/admin`           | `app/admin/layout.tsx`, `page.tsx` |
| `/admin/users`    | `app/admin/users/page.tsx`   |
| `/admin/analytics`| `app/admin/analytics/page.tsx` |
| `/admin/leads`    | `app/admin/leads/page.tsx`   |
| (+ clients, projects, invoices, newsletter, maintenance, …) | |

---

## API routes

```
app/api/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   ├── me/route.ts
│   ├── logout/route.ts
│   ├── health/route.ts
│   ├── register-preference/route.ts
│   ├── login-failed/route.ts
│   └── check-lockout/route.ts
│
├── ai/
│   ├── website-audit/route.ts
│   ├── audit/route.ts
│   ├── copy/route.ts          (copy-generator)
│   ├── builder/route.ts       (landing-page builder)
│   ├── funnel-generator/route.ts
│   └── competitor-analyzer/route.ts
│
├── calculators/
│   └── record/route.ts        (records all calculator types)
│   (+ per-type routes optioneel: roi, break-even, pricing-simulator, …)
│
├── stripe/
│   ├── create-checkout-session/route.ts
│   ├── webhook/route.ts
│   └── customer-portal/route.ts
│
├── contact/route.ts
│
├── analytics/
│   ├── event/route.ts
│   └── visit/route.ts
│
├── plans/route.ts
├── admin/… (leads, clients, projects, invoices, …)
├── portal/…
└── reports/audit-pdf/route.ts
```

---

## Components

```
components/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── Panel.tsx
│   ├── MetricCard.tsx
│   ├── DashboardWidget.tsx
│   ├── ScoreRing.tsx
│   ├── Skeleton.tsx
│   └── index.ts
│
├── dashboard/
│   ├── DashboardNav.tsx       (sidebar)
│   ├── AuditToolClient.tsx
│   └── ReportSummary.tsx
│
├── home/                       (marketing)
│   ├── HeroSection.tsx
│   ├── WebsiteScanSection.tsx
│   ├── ProductFeatures.tsx
│   ├── DashboardPreview.tsx
│   ├── PricingStrip.tsx
│   └── FinalCtaSection.tsx
│
├── calculators/
│   └── CalculatorsClient.tsx
│
├── admin/…
├── portal/…
├── Navbar.tsx
├── SiteShell.tsx
├── SiteFooter.tsx
├── Contact.tsx
└── UpgradeModal.tsx
```

---

## Lib (core logic)

```
lib/
├── auth.ts
├── supabase/
│   ├── client.ts
│   └── server.ts
│
├── prisma.ts
│
├── rateLimit.ts
├── apiSecurity.ts
├── csrf.ts
├── safeRedirect.ts
├── turnstile.ts
├── apiSafeResponse.ts
├── logger.ts
│
├── stripe.ts         (Stripe client + constants)
├── openai.ts
├── ai.ts             (AI barrel / audit entry)
├── ai-website-audit.ts
├── ai/usage.ts
│
├── calculators/
│   ├── record.ts     (persist results)
│   ├── roi.ts
│   ├── breakEven.ts
│   ├── pricing.ts
│   └── discount.ts
│
├── plans.ts
├── audit-limits.ts
├── usage-events.ts
├── mailer.ts
├── email.ts
├── env.ts
├── metadata.ts
├── parse-report-sections.ts
└── (crm, company, newsletter, …)
```

---

## Prisma (database)

```
prisma/
├── schema.prisma
└── migrations/
```

Models o.a.: User, Plan, Lead, Client, AuditReport, CalculatorResult, UsageEvent, AnalyticsEvent, ProcessedStripeEvent, …

---

## Security

- **Middleware:** beschermt `/dashboard`, `/portal`, `/admin`; redirect naar `/login`; safe redirect-param.
- **Rate limits:** auth 10/min, AI 20/min, general 60/min, sensitive 20/min.
- **Headers:** CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy (in `next.config.mjs`).

---

## Deployment (Vercel)

Env vars (zie `.env.example`):

- `DATABASE_URL`, `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID_*`
- `OPENAI_API_KEY`
- `SITE_URL`, `OWNER_EMAILS`, optioneel `TURNSTILE_SECRET_KEY`, `REDIS_URL`
