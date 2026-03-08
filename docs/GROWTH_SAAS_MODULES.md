# Growth & SaaS Infrastructure — Architecture Overview

This document describes the modules implemented for growth and SaaS infrastructure on VDB Digital.

---

## 1. Audit cache (reduce OpenAI costs)

**Goal:** Reduce duplicate scans and API cost by caching audit results for 24 hours.

**Prisma model:**
```prisma
model AuditCache {
  id        String   @id @default(cuid())
  url       String   @unique
  score     Int
  result    Json
  createdAt DateTime @default(now())
  @@index([createdAt])
}
```

**Logic (`lib/ai-website-audit.ts`):**
1. Normalize URL for cache key (`normalizeUrlForCache`: lowercase, no trailing slash).
2. Check if `AuditCache` has an entry for that URL.
3. If cache exists and `createdAt` is within last 24 hours → return cached result (no AI/crawl).
4. Otherwise run full audit (crawl + AI), then upsert cache with result.

**API:** No API changes required; `POST /api/ai/website-audit` uses `runFullWebsiteAudit`, which now includes cache logic.

**Security:** Cache key is normalized URL only; no PII stored. Result JSON is the same shape as API response (scores, summary, signals).

---

## 2. Public audit reports (SEO traffic)

**Goal:** Public shareable pages per domain for SEO and backlinks.

**Prisma model:**
```prisma
model PublicAudit {
  id        String   @id @default(cuid())
  domain    String   @unique
  score     Int
  result    Json     // scores, summary, summaryShort, signals (url, title)
  createdAt DateTime @default(now())
  @@index([domain])
  @@index([createdAt])
}
```

**Route:** `GET /audit/[domain]`  
Example: `/audit/example.com`

**Behaviour:**
- When an audit finishes in `POST /api/ai/website-audit`, a public version is stored (domain = hostname without www, result = scores + summary + signals).
- Public page: Hero, website score, key issues (from summaryShort), summary, CTA “Analyseer uw eigen website” → `/website-scan`.
- Metadata: `generateMetadata()` for title/description/OG using stored result.

**Sitemap:** All `PublicAudit` domains are added to `sitemap.xml` with weekly changeFrequency.

---

## 3. Programmatic SEO tool pages

**Goal:** Dynamic tool landing pages for SEO (e.g. /tools/seo-check, /tools/website-analyse).

**Config:** `lib/programmatic-seo.ts`  
- `programmaticPages`: array of `{ slug, title, description, benefits[], howItWorks[] }`.  
- Slugs: `seo-check`, `website-analyse`, `conversie-analyse`, `snelheid-test`.  
- Helpers: `getProgrammaticSlugs()`, `getProgrammaticPage(slug)`.

**Route:** `GET /tools/[slug]`  
- `generateStaticParams()` returns all programmatic slugs.  
- `generateMetadata({ params })` uses config for title/description/OG.  
- Page: Hero (title + description), benefits, how it works, CTA to “Start gratis website-analyse” → `/website-scan`, internal links (website-audit, website-scan, prijzen).

**Sitemap:** All programmatic tool slugs are in `sitemap.xml`.

**Note:** Existing static tool routes (e.g. `/tools/website-audit`) take precedence; `/tools/[slug]` only serves the slugs defined in `programmatic-seo.ts`.

---

## 4. Analytics events

**Goal:** Track key funnel events for product analytics.

**Utility:** `lib/analytics.ts`  
- `trackEvent(event: string, data?: Record<string, unknown>)`: logs to console and, in production, calls `trackServerEvent` (PostHog if `POSTHOG_API_KEY` set).  
- Events: `audit_started`, `audit_completed`, `upgrade_clicked`, `checkout_started`, `checkout_completed`.

**Where events are fired:**
- **audit_started:** `POST /api/ai/website-audit` (sync and when queue job is created).  
- **audit_completed:** `POST /api/ai/website-audit` after `runFullWebsiteAudit` (with url snippet and score).  
- **upgrade_clicked:** Client-side via `UpgradeTrackLink` on pricing page; link posts to `POST /api/analytics/track` with `{ event: 'upgrade_clicked', data: { plan } }`.  
- **checkout_started:** `POST /api/stripe/create-checkout-session` after session create (plan, userId snippet).  
- **checkout_completed:** Stripe webhook `checkout.session.completed` after user/plan update (plan, userId snippet).

**Client tracking API:** `POST /api/analytics/track`  
- Body: `{ event: string, data?: object }`.  
- Origin check via `validateOrigin(request)`; no auth.  
- Used by `UpgradeTrackLink` for `upgrade_clicked`.

---

## 5. Admin dashboard improvements

**Location:** `/admin/dashboard` (and linked from control-center / owner).

**New “SaaS-kerncijfers” section at top:**
- **Totaal gebruikers:** `prisma.user.count()`.  
- **Actieve abonnementen:** `prisma.user.count({ where: { stripeSubscriptionId: { not: null } } })`.  
- **MRR:** Sum of `plan.price` (cents) for users with active subscription and plan; displayed as €.  
- **Audits deze maand:** Count of `AuditReport` + `AuditHistory` with `createdAt >= startOfMonth`.

Existing overview (visitors, leads, revenue, etc.) remains below.

---

## 6. Performance

- **AI audit route:** `export const maxDuration = 30` in `app/api/ai/website-audit/route.ts` (Vercel/serverless timeout).  
- **Caching:** Audit results cached in `AuditCache` (24h TTL) to avoid repeated crawls and OpenAI calls.  
- **Prisma:**  
  - Admin dashboard uses parallel `Promise.all` and targeted `select` (e.g. `plan: { select: { price: true } }` for MRR).  
  - Public audit and sitemap use `select` to limit fields where possible.

---

## Security considerations

- **Audit cache:** Key is URL only; no user data. Cache is read/write in server context only.  
- **Public audit:** Only non-sensitive result data (scores, summary, url/title) stored; no emails or user ids.  
- **Analytics track:** Origin validation; event name length cap (64); no PII in event payloads (e.g. userId truncated).  
- **Admin metrics:** Behind `requireUser("admin")`; MRR uses only plan price, not raw Stripe data.

---

## Prisma migration

After pulling these changes, run:

```bash
npx prisma migrate dev --name add_audit_cache_and_public_audit
```

This creates the `AuditCache` and `PublicAudit` tables. If the DB is not yet migrated, sitemap and `/audit/[domain]` handle missing tables with try/catch and return empty lists or 404 as appropriate.
