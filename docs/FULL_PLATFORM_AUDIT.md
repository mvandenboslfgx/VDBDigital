# VDB Digital — Volledige platformaudit (production-ready SaaS)

**Datum:** maart 2025  
**Doel:** Platform transformeren naar een 10/10 enterprise-grade SaaS: veilig, schaalbaar, monetiseerbaar, SEO-geoptimaliseerd en onderhoudbaar.

---

## 1. Architectuur

### Huidige staat
- **Stack:** Next.js (App Router), TypeScript, Prisma, PostgreSQL, Stripe, Tailwind, Framer Motion.
- **Structuur:** Duidelijke scheiding: `app/`, `components/`, `lib/`, `modules/`, `prisma/`. API-routes onder `app/api/`.
- **Auth:** Supabase (JWT in cookies); rol in DB (lead, customer, pro, admin, owner).
- **Queue:** BullMQ + Redis voor asynchrone audits wanneer `REDIS_URL` gezet is.

### Ontdekte issues
| Issue | Ernst | Omschrijving |
|-------|--------|---------------|
| Middleware deprecation | Laag | Next.js 16 waarschuwt: "middleware" → "proxy". Geen breaking change nu. |
| In-memory rate limit | Medium | Bij meerdere Vercel instances wordt rate limit niet gedeeld; Redis/Upstash aanbevolen. |
| CSRF-stub in auth | Medium | `lib/auth.ts` exporteert `validateCsrf` die altijd `true` retourneert; admin-routes gebruiken die stub. Echte implementatie staat in `lib/csrf.ts`. |
| Article-tabel bij build | Laag | Sitemap en kennisbank doen `prisma.article.findMany()`; als migraties niet gedraaid zijn faalt static generation (try/catch aanwezig, build slaagt). |

### Aanbevelingen
- Centrale API-wrapper voor consistente error handling en logging.
- Redis-adapter voor rate limit bij scale (setRateLimitStore bij startup).
- Auth: `validateCsrf` in auth.ts laten delegeren naar `lib/csrf.ts`.

---

## 2. Dependencies

### Huidige staat
- Next.js latest, React latest, Prisma 6.19, Stripe 17.7, Zod 4.3, BullMQ, ioredis, Supabase SSR, OpenAI, bcryptjs, cheerio, nodemailer, framer-motion.
- Geen Sentry, PostHog of Plausible in package.json.

### Ontdekte issues
| Issue | Ernst |
|-------|--------|
| Geen error monitoring | Hoog — crashes en API-fouten niet centraal zichtbaar |
| Geen product analytics | Medium — scans, conversies, subscriptions niet gestandaardiseerd getrackt |
| "latest" voor sommige pakketten | Laag — pin naar semver voor reproduceerbare builds |

### Roadmap
- Sentry (of equivalent) toevoegen voor errors.
- PostHog of Plausible voor analytics.
- Dependencies pinnen waar nodig.

---

## 3. Types & build

### Huidige staat
- TypeScript strict; build slaagt. Prisma client gegenereerd via postinstall.

### Ontdekte issues
- Geen: types zijn consistent; Prisma-typen worden correct gebruikt.

---

## 4. API-routes

### Bevindingen
- **Auth:** `/api/auth/me`, login, logout, register, login-failed (rate limit + lockout).
- **Stripe:** webhook (signature + idempotency), create-checkout-session, customer-portal (rate limit).
- **AI/audit:** website-audit (origin, rate limit, plan limit, queue optie), status; overige AI-tools (audit, copy, competitor, etc.).
- **Admin:** leads, projects, content, packages, invoices, etc.; vereisen admin/owner.
- **Contact:** validateCsrf (echte impl), rate limit impliciet via algemene limiet.

### Ontdekte issues
| Route | Issue |
|-------|--------|
| Admin packages/content/projects | Gebruiken `validateCsrf` uit auth (stub); moeten `lib/csrf` gebruiken. |
| Create-checkout | Body `plan` niet met Zod gevalideerd; vertrouwt op toLowerCase + PRICE_IDS. |
| Website-audit | Body niet met Zod; handmatige sanitization. |

### Roadmap
- Zod-schemas voor alle mutating API bodies (checkout, audit, contact).
- Eén CSRF-export (lib/csrf) en auth.ts delegeren.

---

## 5. Prisma-schema

### Huidige staat
- Uitgebreide modellen: User, Plan, Lead, Client, AuditResult, AuditReport, Invoice, Website, Project, Team, AuditHistory, UsageEvent, AIUsage, Article, AuditLog, ProcessedStripeEvent, etc.
- User: planId, stripeCustomerId, stripeSubscriptionId, auditCountCurrentMonth, lastAuditResetAt.
- Plan: name, price, credits, features (JSON).
- Article voor kennisbank; AuditLog voor compliance.

### Ontdekte issues
- Geen structurele tekortkomingen. Plan-namen in code: free, starter, growth, agency; DB Plan.name kan ook pro/business (legacy) zijn.
- Usage: audit limits via User.auditCountCurrentMonth + lib/audit-limits; AI/calculator via aparte tabellen (AIUsage, CalculatorResult). Consistente aanpak.

### Roadmap
- Migraties altijd in CI met `prisma migrate deploy`; seed alleen in dev.

---

## 6. Authenticatie

### Huidige staat
- Supabase: getCurrentUser() via Supabase session; rol uit DB; auto-create User bij eerste login; owner uit OWNER_EMAILS.
- Middleware: beschermt /dashboard, /portal, /admin; admin/owner via getRoleFromApi().
- Login: rate limit + lockout (5 fails → 15 min); recordFailedLogin, isLoginLockedOut.

### Ontdekte issues
| Issue | Ernst |
|-------|--------|
| validateCsrf in auth is stub | Medium — admin mutaties vertrouwen op Origin-only waar CSRF verwacht wordt |
| Geen 2FA | Laag — optioneel voor admin later |
| Session validation | OK — server-side getUser() |

### Roadmap
- CSRF: alle state-changing routes die cookie/session gebruiken, validateCsrf van lib/csrf aanroepen.
- Optioneel: 2FA voor admin (TOTP).

---

## 7. Stripe-integratie

### Huidige staat
- Checkout: create-checkout-session met metadata userId; success_url dashboard/billing; cancel_url pricing.
- Webhook: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted; idempotency via ProcessedStripeEvent vóór verwerking.
- resolvePlanFromPriceId: STRIPE_PRICE_ID_STARTER/GROWTH/AGENCY (en legacy PRO/BUSINESS); koppelt aan Plan (starter, growth, agency).

### Ontdekte issues
| Issue | Ernst |
|-------|--------|
| Plan-limieten vs. specificatie | Medium — Specificatie: Free 1, Starter 10, Pro 50, Agency unlimited. Huidige PLANS: free 1, starter 25, growth 150, agency 500. Afstemmen op productwens. |
| Geen Stripe Customer Portal session rate limit in middleware | Laag — wel in API; voldoende. |
| Invoice history in dashboard | Medium — Billing-pagina toont plan/usage; Stripe-invoices niet getoond (alleen via portal). |

### Roadmap
- Plan-limieten expliciet maken (env of DB) en documenteren: Free 1, Starter 10, Pro 50, Agency unlimited indien gewenst.
- Billing-dashboard: link naar Stripe Portal voor facturen; optioneel: lijst recente invoices via Stripe API.

---

## 8. Error handling

### Huidige staat
- app/error.tsx: client boundary; gebruiksvriendelijke foutmelding.
- app/not-found.tsx: 404 met SiteShell.
- handleApiError in lib/apiSafeResponse: maskeert details in productie.
- Logger voor server-side.

### Ontdekte issues
- Geen centrale error tracking (Sentry); fouten alleen in logs.

### Roadmap
- Sentry (of equivalent) integreren; source maps voor productie.

---

## 9. Data validatie

### Huidige staat
- Zod in lib/validation: contactBodySchema, urlSchema, calculatorRecordBodySchema, seoAuditBodySchema, etc.
- apiSecurity: sanitizeString, sanitizeEmail, sanitizeWebsiteUrl, validateEmailFormat, containsPromptInjection.
- Website-audit: handmatige sanitization + validateOrigin; geen Zod-parse voor body.

### Ontdekte issues
| Plek | Issue |
|------|--------|
| API audit/checkout | Body niet overal met Zod; inconsistentie risico. |
| URL/email | Goed afgedekt door apiSecurity + urlSchema waar gebruikt. |

### Roadmap
- Alle mutating endpoints: body parsen met Zod; 400 bij validatiefout.

---

## 10. Security risks

| Risico | Huidige mitigatie | Aanbeveling |
|--------|-------------------|-------------|
| CSRF op admin | Alleen Origin/Referer in lib/csrf; auth.validateCsrf stub | Echte CSRF-tokens voor gevoelige admin-acties of strikte SameSite + Origin; auth delegeren naar lib/csrf. |
| Rate limit bypass (multi-instance) | In-memory store | Redis (Upstash) voor gedeelde rate limit. |
| XSS | sanitizeString, geen raw HTML from user | Blijft toepassen; CSP aanscherpen (zie hieronder). |
| Open redirect | safeRedirect; next param validated | OK. |
| Prompt injection | containsPromptInjection in audit | OK. |
| Stripe webhook spoofing | Signature verification + idempotency | OK. |
| Brute force login | Lockout + rate limit | OK; eventueel CAPTCHA/Turnstile op login. |
| Sensitive data in response | handleApiError maskeert in prod | OK. |

### Secure headers (next.config.mjs)
- Aanwezig: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Strict-Transport-Security, Permissions-Policy.
- CSP bevat nog `'unsafe-inline'` en `'unsafe-eval'` voor scripts; aanscherpen met nonces waar mogelijk.

---

## 11. Performance

### Bevindingen
- Dashboard: getOrSet met 45s cache voor dashboard data.
- Sitemap/kennisbank: Article.findMany kan traag zijn bij veel artikelen; paginatie of limit.
- Geen edge runtime voor specifieke routes; geen image optimization config behalve remotePatterns.
- Audit: synchroon of via queue; queue voorkomt timeouts bij veel concurrentie.

### Roadmap
- Caching: behouden; eventueel Redis voor cache bij scale.
- Beeldoptimalisatie: Next/Image overal voor user content.
- Report caching: rapporten kunnen gecached worden per shareSlug.

---

## 12. SEO

### Huidige staat
- metadataBase, OG, Twitter in root layout.
- lib/seo-pages: veel /seo/[slug] pagina's (website-analyse, seo-check, etc.).
- Sitemap: static + seo slugs + work + artikelen uit DB.
- robots.txt: disallow /admin, /dashboard, /portal, /login, /register, /create-account, /review/.

### Ontdekte issues
- Sitemap bevat /pricing (redirect naar /prijzen); kan /prijzen in sitemap zetten voor consistentie.
- /website-scan, /seo-check, /conversion-check, /website-analyse: deel al aanwezig als /seo/* of /website-scan; controleren of alle gewenste paden in sitemap staan.

### Roadmap
- Sitemap: alleen canonieke paden (bijv. /prijzen i.p.v. /pricing).
- Metadata per pagina: title, description, canonical; structured data waar relevant.

---

## 13. SaaS gaps (missing features)

| Feature | Status | Actie |
|---------|--------|--------|
| Usage tracking (audit_count, limit, reset) | Aanwezig (User.auditCountCurrentMonth, audit-limits) | Middleware die blokkeert bij limit; upgrade-prompt in UI. |
| Subscription management | Stripe + Plan in DB; portal link | OK; factuurgeschiedenis in dashboard verbeteren. |
| Audit limits per plan | In lib/plans en audit-limits | Afstemmen op Free 1, Starter 10, Pro 50, Agency ∞. |
| Lead funnel (scan → preview → email → unlock) | Deels: preview, email, capture in audit flow | Expliciete funnel-pagina's en lead-dashboard verduidelijken. |
| Competitor analysis in audit | Aparte tool (competitor-analyzer) | Optioneel in hoofdaudit als uitbreiding. |
| Improvement scoring & priority | In audit rapport (scores, improvements) | Uitbreiden met prioriteit (hoog/laag) en score per aanbeveling. |
| Knowledge base (/kennisbank/[slug]) | Aanwezig; Article model | SEO, related articles, internal linking versterken. |
| Admin: leads, users, revenue | Aanwezig (admin/leads, users, finance) | Paginatie; revenue-overzicht uit Stripe of facturen. |
| Error monitoring | Ontbreekt | Sentry (of equivalent). |
| Analytics | Ontbreekt (product) | PostHog of Plausible. |
| Background jobs | BullMQ + worker script | Documenteren; worker in CI of aparte process. |

---

## 14. Improvement roadmap (prioriteit)

1. **Security (10/10):** CSP aanscherpen; CSRF consistent (auth → lib/csrf); rate limit Redis; Zod op alle mutating APIs; secure headers controleren; admin audit log uitbreiden.
2. **Billing engine:** Plan-limieten expliciet (Free 1, Starter 10, Pro 50, Agency ∞); usage middleware; upgrade-prompts; billing-dashboard met facturenlink.
3. **Usage tracking:** Blokkeren bij audit limit in middleware of API; reset_period documenteren (maandelijks).
4. **Audit engine:** Prioriteit/score per aanbeveling; competitor-analyse optie; alle categorieën (technical SEO, performance, mobile UX, conversion, trust, CTA, etc.) expliciet in rapport.
5. **Lead generation:** Funnel-pagina's; lead-dashboard; conversie-tracking.
6. **SEO:** Sitemap canoniek; /website-scan, /seo-check, /conversion-check, /website-analyse in sitemap; metadata overal.
7. **Kennisbank:** Related articles; internal linking; static generation.
8. **Dashboards:** Paginatie admin (leads, users, reports); user dashboard: usage, invoices, audit history.
9. **Error monitoring:** Sentry.
10. **Analytics:** PostHog of Plausible.
11. **Performance:** Caching, report cache, image optimization.
12. **Background jobs:** Documentatie; worker deployment.
13. **UX:** Loading states, foutmeldingen, empty states, onboarding; alle teksten professioneel Nederlands.
14. **Design:** Typography, spacing, kleuren, buttons, forms, cards consistent.
15. **Production checklist:** docs/PRODUCTION_READY_CHECKLIST.md; security, env, Stripe, DB, robots, sitemap, monitoring, logging.

---

## 15. Conclusie

Het platform heeft een solide basis: duidelijke architectuur, Prisma, Stripe, Supabase auth, rate limiting, audit limits, en veel gewenste features (kennisbank, SEO-pagina's, admin, dashboards). Om tot een 10/10 enterprise SaaS te komen zijn de belangrijkste stappen:

- **Beveiliging op niveau brengen:** CSP, CSRF consistent, Redis rate limit, Zod overal, audit logs.
- **Billing en usage:** Limieten expliciet en afgestemd; middleware bij limit; duidelijke upgrade-paden.
- **Observability:** Sentry + product analytics.
- **UX en design:** Consistente Nederlandse teksten, loading/empty states, design system.
- **Documentatie:** Production checklist en deployment/runbooks.

Dit document wordt gebruikt als leidraad voor de implementatie van de verbeteringen in de bijbehorende stappen.
