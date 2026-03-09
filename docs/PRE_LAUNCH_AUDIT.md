# Pre-launch audit — VDB Digital

Korte controle vóór stabiele productie-release. Uitgevoerd na laatste wijzigingen.

---

## 1. Codebase op GitHub

- **Status:** ✅ Volledig gecommit en gepusht.
- `git status` is clean; geen untracked `app/`, `components/`, `lib/`, `modules/`, `prisma/`.
- Vercel bouwt met de volledige codebase.

---

## 2. Database

- Migratie **20260310000000_article_public_audit_cache** voegt Article, AuditCache, PublicAudit toe.
- **Actie:** Eénmalig `npx prisma migrate deploy` tegen productie-DB, daarna `npx prisma generate`.
- Kennisbank- en sitemap-routes vangen ontbrekende tabellen af met try/catch (geen build-crash).

---

## 3. Security

| Onderdeel | Status | Locatie |
|-----------|--------|---------|
| Stripe webhook | ✅ | `stripe.webhooks.constructEvent()` + ProcessedStripeEvent idempotency |
| Admin routes | ✅ | Admin layout: `canAccessAdmin(currentUser)` → redirect naar /dashboard |
| Audit rate limit | ✅ | Per minuut + 10 scans/uur per IP in `POST /api/ai/website-audit` |
| Origin validation | ✅ | `validateOrigin()` op o.a. audit, optimize, analytics, contact, register |
| Public audit PII | ✅ | Alleen domain, score, summary, signals.{url,title}; geen email/userId |

- **Origin-whitelist:** localhost, vdb.digital, vdbdigital.nl, `SITE_URL`, `VERCEL_URL`.

---

## 4. Health check

- **GET /api/health** bestaat.
- Retourneert: `status` (ok/degraded), `database`, `stripe`, `ai`, `timestamp`.
- Geen secrets in response; 200 bij ok, 503 bij degraded.
- Geschikt voor monitoring en load balancers.

---

## 5. Sitemap

- **app/sitemap.ts** levert o.a.:
  - `/`, `/website-scan`, `/prijzen`, `/kennisbank`, `/tools`, `/audit`
  - Static routes, SEO-slugs, programmatic tools, artikelen (indien tabel bestaat), public audits (indien tabel bestaat).
- Bij ontbrekende Article/PublicAudit-tabellen: lege arrays, geen crash.

---

## 6. Environment variables

- **.env.example** bevat o.a.: DATABASE_URL, DIRECT_URL, Supabase, Stripe, OPENAI_API_KEY, JWT_SECRET, SITE_URL.
- **Vercel:** Zie `docs/DEPLOY_CHECKLIST.md` voor de volledige lijst; o.a. DIRECT_URL en STRIPE_WEBHOOK_SECRET zijn nodig voor een stabiele deploy.

---

## 7. Aanbevelingen (optioneel)

1. **Vercel:** Build command `npm run build`; bij serverless timeouts op audit: `maxDuration` op de audit-route verhogen (bv. 30).
2. **Monitoring:** `/api/health` in een uptime-check (bv. Vercel Health Check of externe monitor) opnemen.
3. **Post-launch:** Na eerste deploy sitemap.xml en /website-scan handmatig testen; daarna eventueel Google Search Console indienen.

---

## Conclusie

- Code staat volledig op GitHub.
- Security (webhook, admin, rate limit, origin, geen PII in public audits) is gecontroleerd.
- Health endpoint en sitemap zijn aanwezig en robuust.
- Na het draaien van `prisma migrate deploy` tegen productie en het controleren van de env vars in Vercel is het platform klaar voor een stabiele productie-release.
