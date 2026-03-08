# VDB Digital — Production Ready Checklist

Gebruik deze checklist vóór en na elke productie-release om veiligheid, stabiliteit en compliance te waarborgen.

---

## 1. Beveiliging

| Item | Status | Notities |
|------|--------|----------|
| Content-Security-Policy | ✅ | next.config.mjs; Stripe + connect-src/frame-src |
| X-Frame-Options: SAMEORIGIN | ✅ | |
| X-Content-Type-Options: nosniff | ✅ | |
| Referrer-Policy | ✅ | strict-origin-when-cross-origin |
| Strict-Transport-Security | ✅ | max-age=63072000; includeSubDomains; preload |
| CSRF (Origin + Referer) | ✅ | lib/csrf; auth.validateCsrf delegeert; gebruikt op contact, admin, Stripe portal |
| Rate limiting (auth, AI, Stripe, audit) | ✅ | lib/rateLimit; in-memory; Redis aanbevolen voor multi-instance |
| Login lockout (5 fails → 15 min) | ✅ | rateLimit + lockoutStore |
| Inputvalidatie (Zod) | ✅ | checkout, website-audit, contact; uitbreiden naar overige mutating APIs |
| Geen gevoelige data in API-responses | ✅ | handleApiError maskeert in productie |
| Stripe webhook-signatuur | ✅ | constructEvent; idempotency via ProcessedStripeEvent |
| Admin/Owner RBAC | ✅ | middleware + requireUser/requireOwner in routes |

---

## 2. Build & omgeving

| Item | Status | Notities |
|------|--------|----------|
| `npm run build` slaagt | ✅ | TypeScript strict |
| Geen hardcoded secrets | ✅ | Alleen via env |
| .env.example bijgewerkt | ✅ | Stripe, Supabase, SMTP, REDIS_URL, SITE_URL, OWNER_EMAILS |
| DATABASE_URL + DIRECT_URL | ✅ | Prisma pooler + direct |
| SITE_URL voor redirects/emails | Aanbevolen | Zetten in productie |

---

## 3. Stripe

| Item | Status | Notities |
|------|--------|----------|
| STRIPE_SECRET_KEY (sk_live_) | Verplicht prod | Alleen server-side |
| STRIPE_WEBHOOK_SECRET (whsec_) | Verplicht prod | Webhook endpoint verifiëren |
| STRIPE_PRICE_ID_STARTER / _GROWTH / _AGENCY | Verplicht prod | Of legacy PRO/BUSINESS |
| Webhook URL in Stripe Dashboard | Verplicht | POST /api/stripe/webhook |
| Success/cancel URLs checkout | ✅ | dashboard/billing; /prijzen |

---

## 4. Database

| Item | Status | Notities |
|------|--------|----------|
| Migraties in CI: `prisma migrate deploy` | Aanbevolen | Nooit `migrate dev` in prod |
| Seed alleen in dev | ✅ | prisma/seed.ts |
| Article-tabel voor kennisbank | Vereist | Migraties draaien voor sitemap/kennisbank |

---

## 5. SEO & crawlers

| Item | Status | Notities |
|------|--------|----------|
| robots.txt | ✅ | app/robots.ts; disallow /admin, /dashboard, /portal, /login, /register, /create-account, /review/ |
| sitemap.xml | ✅ | app/sitemap.ts; static + seo slugs + work + artikelen |
| Canonieke URL /prijzen | ✅ | Geen /pricing in sitemap (redirect) |
| Metadata (title, description, OG) | ✅ | layout + pageMetadata per pagina |

---

## 6. Monitoring & logging

| Item | Status | Notities |
|------|--------|----------|
| Gestructureerde logging (lib/logger) | ✅ | Server-side |
| Error monitoring (Sentry e.d.) | Optioneel | Nog niet geïntegreerd; aanbevolen voor prod |
| Analytics (PostHog/Plausible) | Optioneel | Nog niet geïntegreerd |
| Health endpoint | ✅ | /api/health |

---

## 7. Gebruik & limieten

| Item | Status | Notities |
|------|--------|----------|
| Auditlimieten per plan | ✅ | Free 1, Starter 10, Pro 50, Agency ∞ (lib/plans + audit-limits) |
| Auditcount-increment bij vol rapport | ✅ | captureAuditLead → incrementAuditCount(userId) |
| Maandelijkse reset auditcount | ✅ | getAndEnsureCurrentMonthCount |
| Upgrade-prompt bij limiet | ✅ | Dashboard billing + API 429-bericht |

---

## 8. UX & taal

| Item | Status | Notities |
|------|--------|----------|
| Professioneel Nederlands | ✅ | i18n nl; teksten in components |
| Foutmeldingen gebruiksvriendelijk | ✅ | error.tsx; safeJsonError; Nederlandse API-berichten |
| Loading/empty states | Deels | Per pagina controleren |

---

## 9. Pre-launch acties

1. **Env controleren:** Alle vereiste variabelen in productie-omgeving (Supabase, Stripe, SMTP, SITE_URL, OWNER_EMAILS).
2. **Stripe webhook:** In Dashboard ingesteld; signing secret in STRIPE_WEBHOOK_SECRET.
3. **Migraties:** `prisma migrate deploy` in CI of handmatig vóór eerste deploy.
4. **Redis (optioneel):** REDIS_URL zetten voor gedeelde rate limit en audit-queue.
5. **Owner-e-mails:** OWNER_EMAILS in .env voor admin/owner-toegang.
6. **Test checkout:** Een testabonnement doorlopen (success + cancel).
7. **Test audit:** Website-audit met en zonder account; controleer limietbericht.

---

## 10. Post-launch

- Logs en errors monitoren; bij integratie Sentry/PostHog dashboards controleren.
- Stripe Dashboard: abonnementen en webhook-delivery controleren.
- Rate limit: bij veel verkeer Redis inschakelen (setRateLimitStore).

---

*Laatst bijgewerkt: maart 2025. Bij wijzigingen in security of infra deze checklist bijwerken.*
