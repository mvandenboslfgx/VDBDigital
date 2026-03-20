# VDB Digital – Projectoverzicht voor ChatGPT Triple Check

Dit document beschrijft het volledige project zodat ChatGPT (of een andere reviewer) een **dubbele/triple check** kan doen op correctheid, veiligheid, consistentie en volledigheid.

---

## 1. Projecttype & stack

- **Framework:** Next.js 16 (App Router), React, TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** Supabase Auth (login, signup, OAuth, password reset)
- **Billing:** Stripe (abonnementen, webhooks, customer portal)
- **AI:** OpenAI (website-audit, insights)
- **Styling:** Tailwind CSS, Framer Motion
- **Deploy:** Vercel

---

## 2. Belangrijke mappen

```
app/                    # Next.js App Router: pages, layouts, API routes
  api/                  # API routes (auth, stripe, ai, admin, contact, …)
  admin/                # Admin-pagina’s (layout beveiligd, require admin/owner)
  dashboard/            # User-dashboard (layout beveiligd, require user)
  website-scan/         # Publieke scanpagina
  prijzen/              # Prijzen + “Wat blijft er over”
  voorwaarden/          # Algemene voorwaarden
  privacy/              # Privacybeleid
  cookies/              # Cookiebeleid
  disclaimer/           # Disclaimer
  seo/[slug]/           # Programmatische SEO-pagina’s
  tools/[slug]/         # Programmatische tool-pagina’s
  report/[slug]/        # Gedeelde rapporten (share slug)
  kennisbank/           # Kennisbank-artikelen
components/             # Herbruikbare UI (Navbar, SiteShell, forms, …)
lib/                    # Shared logic (auth, prisma, stripe, cache, rateLimit, …)
modules/                # Feature-modules (audit, leads, …)
prisma/                 # Schema, migrations, seed
locales/                # i18n (nl, en, de)
proxy.ts                # Edge middleware (headers, security)
```

---

## 3. Kernflows om te controleren

### 3.1 Website-scan & rapporten
- **Publiek:** `app/website-scan/page.tsx` + `components/home/WebsiteScanSection.tsx`  
  - Alleen URL → preview (scores), geen e-mail verplicht.  
  - Volledig rapport: vereist e-mail of ingelogde user.
- **API:** `app/api/ai/website-audit/route.ts`  
  - Preview: `preview: true`, geen e-mail.  
  - Full: e-mail verplicht; bij ingelogde user: maandlimiet (`lib/audit-limits.ts`: free=1, starter=10, pro=50, agency=∞).  
  - Lead capture: `modules/leads/auditLead.ts` (Lead + AuditReport).  
  - E-mail rapport: `sendAuditReportEmail` (nodemailer).
- **Rapporten:** Dashboard toont rapporten waar `lead.email === user.email`. Gedeelde rapporten: `app/report/[slug]/page.tsx` (shareSlug).

### 3.2 Auth
- **Supabase:** `lib/supabase/server.ts` (createClient), `lib/auth.ts` (getCurrentUser, requireUser).  
- **Callbacks:** `app/auth/callback/route.ts` (OAuth exchange, redirect).  
- **Login/signup/reset:** `app/login/`, `app/register/`, `app/reset-password/`.  
- **Beveiliging:** Geen secrets in client; server-only voor Stripe/OpenAI/JWT.

### 3.3 Stripe & abonnementen
- **Webhook:** `app/api/stripe/webhook/route.ts`  
  - Signature check, idempotency (`ProcessedStripeEvent`).  
  - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`.  
  - Bij delete: user naar gratis plan, `stripeSubscriptionId` null, role lead.
- **Plans:** `lib/audit-limits.ts`, `lib/stripe/resolvePlanFromPriceId.ts`, `lib/plans.ts`.  
- **Checkout/portal:** `app/api/stripe/create-checkout-session/route.ts`, `app/api/stripe/customer-portal/route.ts`.

### 3.4 Voorwaarden, privacy, prijzen
- **Prijzen:** `app/prijzen/page.tsx` – sectie “Wat als ik opzeg? Wat blijft er over?” (terug naar gratis, rapporten blijven, 1 scan/maand).
- **Voorwaarden:** `app/voorwaarden/page.tsx` – §4 Betalingen (Stripe), §5 Abonnementen & opzegging, §5b Herroepingsrecht/restitutie.
- **Privacy:** `app/privacy/page.tsx` – §8 Bewaartermijn (na opzegging, accountverwijdering), §9 Rechten.
- **Help:** `app/help/page.tsx` – FAQ o.a. “Wat als ik opzeg?”.

### 3.5 Admin
- **Layout:** `app/admin/layout.tsx` – redirect naar login als geen user; alleen admin/owner.
- **Sidebar:** `components/admin/OwnerSidebar.tsx` – navigatie.  
- **Control center:** `app/admin/control-center/page.tsx`, `app/api/admin/control-center/live/route.ts`.  
- **E-mailconfig:** `app/admin/email-config/`, API `app/api/admin/email-config/`.

### 3.6 Security
- **Rate limiting:** `lib/rateLimit.ts` – o.a. `rateLimitSensitive` op webhook, auth, contact.
- **Request size:** `lib/requestSafety.ts` – `isBodyOverLimit` op API’s.
- **CSRF:** `validateCsrf` waar van toepassing (admin API’s).
- **Headers:** `proxy.ts` / next.config – CSP, X-Frame-Options, HSTS, etc.
- **Validation:** Zod-schema’s op API-body’s.

---

## 4. Belangrijke bestanden (pad + doel)

| Pad | Doel |
|-----|------|
| `app/layout.tsx` | Root layout, fonts, metadata, StructuredData, Tawk, CommandPalette |
| `app/page.tsx` | Homepage (dynamic imports voor secties) |
| `app/error.tsx` | Error boundary (dev: toon message, prod: veilige melding) |
| `app/global-error.tsx` | Root crash boundary |
| `next.config.mjs` | Security headers, images (AVIF/WebP), redirects, compress |
| `proxy.ts` | Edge middleware (security/cache headers) |
| `prisma/schema.prisma` | Alle modellen (User, Lead, AuditReport, Plan, Invoice, …) |
| `lib/auth.ts` | getCurrentUser, requireUser, getRoleForNewUser |
| `lib/audit-limits.ts` | getMonthlyAuditLimit, getAndEnsureCurrentMonthCount, incrementAuditCount |
| `lib/metadata.ts` | pageMetadata (canonical, OG, Twitter), siteUrl |
| `lib/stock-photos.ts` | Unsplash-URL’s voor homepage-secties |
| `lib/seo-pages.ts` | Config voor /seo/[slug] (website-analyse, seo-check, seo-analyse-webshop, …) |
| `lib/programmatic-seo.ts` | Config voor /tools/[slug] |
| `app/sitemap.ts` | Dynamische sitemap (static + seo + tools + reports + …) |
| `app/robots.ts` | allow /, disallow admin, dashboard, portal, login, … |

---

## 5. Triple-check checklist (voor ChatGPT)

- [ ] **Scans & rapporten:** Preview zonder e-mail; full met e-mail; limiet per plan (1/10/50/∞); rapporten gekoppeld aan lead.email; na opzegging rapporten nog zichtbaar.
- [ ] **Stripe:** Webhook-signatuur; idempotency; bij subscription.deleted user naar gratis plan; invoice events gelogd/gehandeld.
- [ ] **Auth:** Supabase server client; redirect na OAuth; geen secrets in client.
- [ ] **Voorwaarden/privacy/prijzen:** Tekst “wat blijft er over” en opzegging consistent tussen prijzen, voorwaarden, help en privacy (bewaartermijn, verwijdering).
- [ ] **Admin:** Alleen admin/owner; gevoelige API’s (email-config, leads, …) met auth + rate limit + validatie.
- [ ] **Security:** Geen .env in repo; rate limits op gevoelige endpoints; body size limits; Zod op input.
- [ ] **SEO:** Sitemap bevat belangrijke routes; robots correct; canonicals en OG op pagina’s.
- [ ] **Design:** Eén primaire kleur (indigo); geen losse gold/amber in belangrijke UI.

---

## 6. Hoe de volledige code te delen met ChatGPT

Het project is te groot om in één keer te plakken. Opties:

1. **Volledige handoff (aanbevolen)** – Gebruik **`docs/CHATGPT_COMPLETION_HANDOFF.md`**: daarin staan welke bestanden je upload, de export-commando’s, en een **kant-en-klare prompt** om productie-risico’s en concrete patches te krijgen.
2. **Alleen dit document** – Geef `docs/PROJECT_FOR_CHATGPT_TRIPLE_CHECK.md` (dit bestand) aan ChatGPT en vraag om de checklist in §5 te doorlopen op basis van de beschreven flows en bestanden. Geen code nodig (minder precies dan met export).
3. **Volledige code-export** – Run in de projectroot:  
   `node scripts/export-for-chatgpt-review.js`  
   Er wordt dan **PROJECT_EXPORT_FOR_REVIEW.txt** aangemaakt (ca. 1,5+ MB; honderden bestanden, inclusief o.a. `proxy.ts`, `eslint.config.mjs`, `prisma.config.ts`).  
   - Als ChatGPT bestandsupload ondersteunt: upload dit bestand en vraag om een triple check op de genoemde punten.  
   - Anders: open het bestand en plak in delen (bijv. eerst `app/`, dan `lib/`, dan `components/`, …) met de vraag om per deel te controleren.
4. **Specifieke bestanden** – Voor een gerichte check: geef de exacte bestandspaden uit §4 en vraag ChatGPT die regel voor regel te controleren.

---

## 7. Environment-variabelen (niet in repo)

- `DATABASE_URL`, `DIRECT_URL` – PostgreSQL
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase Auth
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` – Stripe
- `OPENAI_API_KEY` – OpenAI
- `JWT_SECRET` – o.a. newsletter
- `SITE_URL` – basis-URL (bijv. https://www.vdbdigital.nl)
- Optioneel: Resend/SMTP voor e-mail, Redis-URL voor cache/queue

Validatie (optioneel): `npm run validate-env` (zie `scripts/validate-env.js`).
