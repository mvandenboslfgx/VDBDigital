# VDB Digital — Production Readiness Audit

**Date:** 2025  
**Scope:** Full repository scan for security, performance, scalability, and maintainability.  
**Brand:** VDB Digital · **Legal entity:** VDB Digital Software.

---

## 1. Architecture summary

### 1.1 Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router), React, Tailwind, Framer Motion |
| Auth | Supabase Auth (JWT cookies, SSR), Prisma `User` sync |
| Database | PostgreSQL, Prisma ORM |
| Payments | Stripe (Checkout, Webhooks, Customer Portal) |
| AI | OpenAI (lib/openai), modules/ai + legacy modules (ai-audit, ai-copy, ai-builder, funnel-generator, competitor-analyzer) |
| Email | Nodemailer (lib/email, lib/mailer), modules/email |

### 1.2 Structure

- **app/** — Routes: dashboard, admin, portal, auth, marketing pages, API routes under `app/api/`.
- **lib/** — Core: auth, rateLimit, apiSecurity, apiSafeResponse, validation (Zod), logger, auditLog, cache, runInBackground, stripe, plans, features, usage, audit-limits, email, mailer, prisma, openai, ai-website-audit.
- **modules/** — Feature domains: calculators, ai (marketing/landing/seo), leads (auditLead), email; plus legacy ai-audit, ai-copy, ai-builder, funnel-generator, competitor-analyzer, crm, deploy.
- **components/** — UI and dashboard components.
- **prisma/** — Schema, migrations, seed.

### 1.3 Security layers

- **Middleware:** Protects `/dashboard`, `/portal`, `/admin`; unauthenticated → `/login`. `/admin` requires `role === "admin"` (via `/api/auth/me`).
- **RBAC:** `lib/permissions.ts` (canAccessAdmin, canAccessDashboard, canAccessPortal); admin layout uses `canAccessAdmin(currentUser)`.
- **API:** Origin/referer validation (`validateOrigin`), rate limits (auth, AI, sensitive, general), login lockout (5 failures → 15 min). Many routes use `getCurrentUser` or `requireUser("admin")`.
- **Stripe webhook:** Signature verification, idempotency via `ProcessedStripeEvent`, no auth (signature is the auth).
- **Input:** Zod on contact and calculator record; elsewhere manual checks and `sanitizeString` / `sanitizeWebsiteUrl`.

---

## 2. Verification results

### 2.1 Security best practices

| Check | Status | Notes |
|-------|--------|------|
| Protected routes require auth | ✅ | Middleware redirects unauthenticated users from dashboard/portal/admin. |
| Admin requires role | ✅ | Middleware + admin layout enforce `role === "admin"`. |
| API origin validation | ⚠️ Partial | Contact, calculators, AI (website-audit, copy, audit, marketing, landing, seo), analytics, newsletter use `validateOrigin`. **Missing:** competitor-analyzer, funnel-generator, builder, deploy, preview, review, notifications, health, onboarding, plans, stripe (checkout/portal), auth (me, register-preference). |
| CSRF | ⚠️ Weak | `lib/csrf.ts` has real `validateCsrf`; `lib/auth.ts` exports a no-op `validateCsrf` (always true). Admin packages/content import from auth — effective CSRF disabled for those. Contact uses `lib/csrf.validateCsrf`. |
| Input sanitization | ✅ | apiSecurity: sanitizeString, sanitizeEmail, sanitizeWebsiteUrl, validateEmailFormat. Prompt-injection check on website-audit URL. |
| Secrets not in client | ✅ | Only `NEXT_PUBLIC_*` and SITE_URL/VERCEL_URL in client; Stripe keys, OpenAI, DB, SMTP server-side only. |
| Safe error responses | ✅ | handleApiError / safeJsonError avoid leaking stack or internals in production. |
| Security headers | ✅ | CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy in next.config.mjs. CSP allows `unsafe-inline` and `unsafe-eval` for scripts (typical for Next.js). |

### 2.2 Rate limiting usage

| Route / area | Rate limit | Notes |
|--------------|------------|--------|
| Auth (login, register, me) | rateLimitAuth (10/min) | ✅ |
| Register preference | rateLimitRegistration (5/min) | ✅ |
| Contact, calculators/record, reports/pdf, analytics/event, analytics/visit, newsletter | rateLimitSensitive (20/min) | ✅ |
| AI: website-audit, copy, audit, marketing-strategy, landing-page, seo-audit | rateLimitAi (20/min) | ✅ |
| Plans | rateLimit (60/min) | ✅ |
| **AI: competitor-analyzer, funnel-generator, builder** | **None** | ❌ Open to abuse; call OpenAI with no throttle. |
| **Preview** | Inline 10/5min | ✅ Custom; could use lib/rateLimit for consistency. |
| **Review** | Inline map-based | ✅ Custom. |
| Notifications, onboarding/complete, deploy, stripe (checkout/portal) | None | Acceptable for authenticated/session flows; deploy could add sensitive limit. |

### 2.3 RBAC protections

| Area | Protection | Notes |
|------|-------------|--------|
| `/admin` (UI) | Middleware + layout | Only `role === "admin"` can access. |
| `api/admin/*` | requireUser("admin") | All checked routes use it. |
| Dashboard/portal APIs | getCurrentUser / requireUser() | User-scoped; portal uses requireUser then client by userId. |
| AI tools (marketing, landing, seo) | canUseAiTools(dbUser) | ✅ Plan-gated. |
| AI (website-audit) | Audit limit by plan (getMonthlyAuditLimit) | ✅ No canUseAiTools; separate limit model. |
| **AI (copy, audit, competitor, funnel, builder)** | **No canUseAiTools** | ❌ Copy/audit/competitor/funnel/builder do not check plan; anyone with origin can call (or no origin on competitor/funnel/builder). |

### 2.4 API validation coverage

| Route | Validation | Notes |
|-------|------------|--------|
| Contact | Zod (contactBodySchema) | ✅ |
| Calculators record | Zod (calculatorRecordBodySchema) | ✅ |
| **Other API bodies** | **Manual / ad hoc** | ⚠️ AI routes, auth, admin, etc. use manual checks. No Zod on AI request bodies (marketing, landing, seo, copy, audit, competitor, funnel, builder). |

### 2.5 Stripe webhook safety

| Check | Status | Notes |
|-------|--------|------|
| Signature verification | ✅ | stripe.webhooks.constructEvent(body, sig, webhookSecret); 400 on failure. |
| Idempotency | ✅ | ProcessedStripeEvent before handler logic; early return 200 if event id exists. |
| Processed event stored after success | ✅ | Create after handler; on create failure, re-check and return 200 if exists. |
| No auth | ✅ | Correct; webhook auth is signature. |
| Plan/role sync | ✅ | checkout.session.completed and customer.subscription.updated set planId and role; customer.subscription.deleted resets to free and role lead. |
| Background audit log | ⚠️ Minor | subscription.updated uses runInBackground for auditPlanUpgrade; checkout.session.completed still **awaits** auditPlanUpgrade (blocks response slightly). |

### 2.6 OpenAI usage limits

| Mechanism | Status | Notes |
|-----------|--------|------|
| Plan-based AI limit (lib/usage) | ✅ | getUsage / checkUsageLimit; incrementAiUsage in usage.ts and in modules/ai (marketing, landing, seo). |
| website-audit | ✅ | Uses audit limit (getMonthlyAuditLimit) for logged-in users. |
| **AI copy** | ⚠️ | No getCurrentUser; no incrementAiUsage in route — usage not tracked for copy. |
| **AI audit (legacy)** | ⚠️ | Uses recordAIUsage (lib/ai/usage) not incrementAiUsage (lib/usage) — two usage systems. |
| **competitor, funnel, builder** | ❌ | No user, no usage tracking, no plan check; OpenAI called with no limit. |

### 2.7 Tenant isolation

| Area | Scoping | Notes |
|------|---------|--------|
| Reports (audit-pdf) | report.lead.email === user.email | ✅ |
| Notifications | getNotificationsForUser(user.id) | ✅ |
| Onboarding | User update by user.id | ✅ |
| Stripe checkout/portal | user.id in metadata / lookup | ✅ |
| Portal support | client by userId | ✅ |
| Portal newsletter | user.id | ✅ |
| Dashboard data | Queries by user.id / user.email | ✅ |
| Admin | No tenant scope (intended) | ✅ |
| **Review route** | Needs verification | Review by token; ensure no cross-tenant leak. |

---

## 3. Identified issues

### 3.1 Potential performance bottlenecks

- **In-memory cache:** Dashboard analytics, admin metrics, and health use a 45s in-memory cache. Per-instance; under multiple instances each instance has its own cache (no shared Redis).
- **Rate limit store:** In-memory; under multiple instances limits are not shared (could allow 20 × N requests per minute across N instances).
- **Admin metrics / dashboard:** Multiple Prisma aggregations per request when cache misses; acceptable with 45s TTL.
- **N+1 risk:** Some admin/list routes use include/relations; no obvious N+1 in critical paths. Worth auditing any `findMany` in loops.
- **Large payloads:** No explicit body size limits on API routes; Next.js default body parsing applies.

### 3.2 Security risks

| Risk | Severity | Description |
|------|----------|-------------|
| **AI routes without origin or rate limit** | High | competitor-analyzer, funnel-generator, builder have no validateOrigin, no rate limit, no auth. Can be called by anyone; OpenAI usage and cost unbounded. |
| **AI routes without canUseAiTools** | Medium | copy, audit, competitor, funnel, builder do not check plan; free users can use paid AI features. |
| **Inconsistent AI usage tracking** | Medium | recordAIUsage (lib/ai/usage) vs incrementAiUsage (lib/usage); copy route does not record usage. |
| **CSRF no-op in auth** | Low | validateCsrf from lib/auth always returns true; admin routes using it have no real CSRF. |
| **X-Forwarded-For trust** | Low | getClientKey uses x-forwarded-for for rate limiting; if app is not behind a trusted proxy, IP can be spoofed (weaker limits). |
| **CSP unsafe-inline / unsafe-eval** | Low | Reduces XSS mitigation; common with Next.js; consider tightening when possible. |

### 3.3 Unused or dead code

- **lib/ai.ts** — Re-exports openai, ai-website-audit, recordAIUsage. Some code may still use it; prefer importing from lib/openai and lib/usage directly for clarity.
- **Two usage systems** — lib/ai/usage (recordAIUsage) and lib/usage (incrementAiUsage, getUsage). Consolidation would reduce confusion and ensure one source of truth for plan limits.
- **validateCsrf in auth** — No-op; callers (admin packages, content) think they have CSRF; consider removing or delegating to lib/csrf.

### 3.4 Missing error handling

- **Notifications route:** On error returns 200 with empty notifications; does not use handleApiError or log.
- **Several admin routes:** Use logger.error then return 500 but do not use handleApiError (inconsistent logging shape).
- **competitor-analyzer, funnel-generator, builder:** No try/catch around JSON parse; invalid JSON could throw unhandled.
- **Stripe webhook:** First auditPlanUpgrade (checkout.session.completed) is awaited; if it throws, webhook returns 500 and Stripe retries (idempotency prevents double apply but audit log may be incomplete). Prefer runInBackground for consistency.

---

## 4. Recommended improvements

### 4.1 Scalability

- **Redis (or similar) for rate limit and lockout:** Use pluggable store (lib/rateLimit already supports setRateLimitStore / setLockoutStore) with Redis so multiple instances share limits.
- **Redis or shared cache for dashboard/admin/health:** Optional; reduces DB load across instances and keeps metrics consistent.
- **Background jobs:** For email and audit logging, runInBackground is used in several places; ensure all non-critical side effects (e.g. audit after checkout) use it so webhook/response time stays low.
- **DB connection pooling:** Document use of pooler (e.g. Supabase pooler) and DIRECT_URL for migrations; already in .env.example.

### 4.2 Security (priority)

1. **Add validateOrigin + rateLimitAi + canUseAiTools to:**  
   `api/ai/competitor-analyzer`, `api/ai/funnel-generator`, `api/ai/builder`. Require authenticated user with plan that has AI access; call incrementAiUsage after success.
2. **Unify AI usage:** Prefer lib/usage (incrementAiUsage, getUsage, checkUsageLimit) everywhere; migrate recordAIUsage callers to incrementAiUsage and deprecate lib/ai/usage or make it a thin wrapper.
3. **CSRF:** Use lib/csrf.validateCsrf in admin routes that mutate state; remove or replace the no-op validateCsrf in lib/auth.
4. **Zod on AI bodies:** Add schemas for marketing-strategy, landing-page, seo-audit, copy, audit, competitor, funnel, builder and use safeParse in routes to return 400 on invalid input.
5. **Optional:** Add rate limit to deploy and notifications (e.g. rateLimitSensitive per user) to prevent abuse.

### 4.3 Code cleanliness

- **Centralize rate limiting:** Replace inline rate limit in preview and review with lib/rateLimit (e.g. rateLimitSensitive) for one place to tune and optional Redis.
- **Consistent error handling:** Use handleApiError in all API catch blocks and ensure notifications route logs and returns 500 on unexpected errors.
- **Stripe webhook:** Use runInBackground for auditPlanUpgrade in checkout.session.completed so both webhook handlers behave the same.
- **Document two usage systems:** If keeping both temporarily, document in docs/STRIPE.md or ARCHITECTURE when to use recordAIUsage vs incrementAiUsage and plan migration.

### 4.4 Developer experience

- **API contract docs:** List public/post body schemas (e.g. in docs or OpenAPI fragment) so frontend and partners know validation rules.
- **Health endpoint:** Already cached; consider adding a simple /api/health/ready that skips cache for k8s liveness if needed.
- **Env validation:** Use a small schema (e.g. Zod) at startup for required env (DATABASE_URL, Stripe keys, etc.) so misconfiguration fails fast.
- **Audit log queries:** Add optional admin UI or script to query AuditLog by event type or userId for support and compliance.

---

## 5. Summary table

| Category | Status | Priority actions |
|----------|--------|------------------|
| **Security** | ⚠️ Gaps | Add origin + rate limit + auth + canUseAiTools to competitor, funnel, builder; fix CSRF; optional Zod on all AI bodies. |
| **Rate limiting** | ⚠️ Partial | Add rateLimitAi to three AI routes; consider Redis for multi-instance. |
| **RBAC** | ⚠️ Partial | Enforce canUseAiTools (and usage limits) on all AI routes. |
| **API validation** | ⚠️ Partial | Extend Zod to AI and other mutation routes. |
| **Stripe webhook** | ✅ Good | Optional: runInBackground for first auditPlanUpgrade. |
| **OpenAI limits** | ⚠️ Inconsistent | Unify on lib/usage; ensure every AI route increments and checks plan. |
| **Tenant isolation** | ✅ Good | Document review route; rest scoped correctly. |
| **Performance** | ✅ Adequate | Cache in place; add Redis for scale. |
| **Error handling** | ⚠️ Mixed | handleApiError everywhere; fix notifications and JSON parse in AI routes. |
| **Dead code / consistency** | ⚠️ Minor | Consolidate usage tracking; remove or fix auth validateCsrf. |

---

*This audit reflects the state of the repository at the time of the scan. Re-scan after applying changes and before production launch.*
