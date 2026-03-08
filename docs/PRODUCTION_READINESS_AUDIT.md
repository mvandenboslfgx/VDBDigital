# VDB Digital — Production Readiness Audit

**Date:** 2025  
**Scope:** Full repository scan.  
**Focus:** Security, RBAC, API validation, Stripe, OpenAI limits, rate limiting, tenant isolation, Prisma performance, caching, error handling, duplication, dead code.

---

## Executive summary

| Area | Status | Priority |
|------|--------|----------|
| Security (auth, origin, CSRF) | ⚠️ Gaps | P1 |
| RBAC | ✅ Solid | — |
| API validation (Zod) | ⚠️ Partial | P2 |
| Stripe billing | ✅ Good | — |
| OpenAI usage limits | ⚠️ Inconsistent | P1 |
| Rate limiting | ⚠️ Gaps | P2 |
| Tenant isolation | ✅ Good | — |
| Prisma query performance | ⚠️ Minor risks | P2 |
| Caching | ✅ In place | — |
| Error handling | ⚠️ Inconsistent | P2 |
| Code duplication | ⚠️ Present | P3 |
| Dead code | ⚠️ Minor | P3 |

**Top actions:** (1) Gate AI copy/audit with `canUseAiTools` and unify usage tracking; (2) Add rate limit and/or validation to notifications, deploy, health, analytics/visit; (3) Standardize on `handleApiError` and add pagination/take where missing.

---

## 1. Security

### 1.1 Authentication & route protection

| Check | Result |
|-------|--------|
| Middleware | ✅ Protects `/dashboard`, `/portal`, `/admin`; unauthenticated → `/login`. |
| Admin role | ✅ `/admin` requires `role === "admin"` via middleware + `getRoleFromApi` and layout `canAccessAdmin`. |
| API auth | ✅ Dashboard/portal APIs use `getCurrentUser` or `requireUser()`; all `api/admin/*` use `requireUser("admin")`. |

### 1.2 Origin / referer validation

| Route | validateOrigin |
|-------|----------------|
| contact, calculators/record, reports/pdf | ✅ |
| ai/* (website-audit, copy, audit, marketing, landing, seo, competitor, funnel, builder) | ✅ |
| analytics/event, auth/register-preference, newsletter/subscribe | ✅ |
| **notifications** | ❌ None (auth only) |
| **onboarding/complete** | ❌ None |
| **deploy** | ❌ None |
| **health** | ❌ Intended (no auth) |
| **plans** | ❌ None (public) |
| **analytics/visit** | ❌ None (rate limit only) |
| **auth/me, login, register, logout** | ❌ (auth flows) |
| **stripe/checkout, customer-portal** | ❌ (session-based) |

**Risk:** Notifications and deploy are authenticated but could be called from arbitrary origins; plans and analytics/visit are public with rate limit only. **Recommendation:** Add `validateOrigin` to notifications, deploy, and (if desired) plans and analytics/visit.

### 1.3 CSRF

- `lib/auth.validateCsrf` is a no-op (always `true`). Admin packages/content import it — no real CSRF on those mutations.
- Contact uses `lib/csrf.validateCsrf` (real check).
- **Recommendation:** Use `lib/csrf.validateCsrf` for admin mutation routes or remove the no-op from auth.

### 1.4 Input sanitization & safe errors

- ✅ `apiSecurity`: `sanitizeString`, `sanitizeEmail`, `sanitizeWebsiteUrl`, `validateEmailFormat`; website-audit uses `containsPromptInjection` on URL.
- ✅ `handleApiError` / `safeJsonError` used on many routes; production does not leak stack.

---

## 2. RBAC permissions

| Layer | Implementation |
|-------|----------------|
| Middleware | Redirects unauthenticated from protected paths; for `/admin`, fetches role via `/api/auth/me` and redirects non-admin to `/dashboard`. |
| Admin layout | `canAccessAdmin(currentUser)`; redirects and logs on violation. |
| Admin APIs | All 14+ admin route files use `requireUser("admin")` before logic. |
| Dashboard/portal | Use `getCurrentUser` or `requireUser()`; portal support uses `requireUser()` then client by `userId`. |
| AI tools (product) | marketing-strategy, landing-page, seo-audit, competitor-analyzer, funnel-generator, builder use `canUseAiTools(dbUser)` → 403 if not allowed. |
| **AI copy** | ❌ No `getCurrentUser` / `canUseAiTools` — any origin can call (rate-limited). |
| **AI audit (legacy)** | ❌ No `canUseAiTools` — any authenticated user can call. |
| **website-audit** | Uses audit limit by plan (getMonthlyAuditLimit), not canUseAiTools. |

**Recommendation:** Add `getCurrentUser` + `canUseAiTools` to AI copy and AI audit so plan-gating is consistent; optionally add `checkUsageLimit` before heavy AI calls.

---

## 3. API validation coverage

| Route | Zod / validation |
|-------|-------------------|
| contact | ✅ `contactBodySchema` |
| calculators/record | ✅ `calculatorRecordBodySchema` |
| All other API routes | ❌ Ad-hoc (manual checks, sanitizeString, etc.) |

**Gap:** No Zod on AI request bodies (copy, audit, marketing, landing, seo, competitor, funnel, builder), auth bodies, admin bodies, or deploy. **Recommendation:** Add schemas in `lib/validation.ts` for AI and other mutation payloads and use `safeParse`; return 400 with message on failure.

---

## 4. Stripe billing safety

| Check | Result |
|-------|--------|
| Webhook signature | ✅ `stripe.webhooks.constructEvent(body, sig, webhookSecret)`; 400 on failure. |
| Idempotency | ✅ `ProcessedStripeEvent`; early 200 if event id already processed. |
| Event handling | ✅ checkout.session.completed, customer.subscription.updated, customer.subscription.deleted update `User.planId`, `stripeSubscriptionId`, `role`. |
| Background audit | ✅ `auditPlanUpgrade` run via `runInBackground` (checkout + subscription.updated). |
| No auth on webhook | ✅ Correct; auth is signature. |

No changes required for production readiness.

---

## 5. OpenAI usage limits

| Mechanism | Status |
|-----------|--------|
| Plan limits (lib/usage) | ✅ `getUsage`, `checkUsageLimit`, `incrementAiUsage`; used by dashboard billing and by marketing, landing, seo (modules/ai). |
| website-audit | ✅ Uses audit limit (getMonthlyAuditLimit) for logged-in users. |
| **AI copy** | ❌ No `getCurrentUser`; no `incrementAiUsage` — usage not tracked in lib/usage; no plan gate. |
| **AI audit (legacy)** | ⚠️ Uses `recordAIUsage` (lib/ai/usage) only — different from `incrementAiUsage` (lib/usage); plan limits in billing don’t count this. |
| competitor, funnel, builder | ✅ `canUseAiTools` + `incrementAiUsage` after fix. |

**Two systems:** `lib/ai/usage.recordAIUsage` (audit route) vs `lib/usage.incrementAiUsage` (everyone else). Billing/limits use `lib/usage`. **Recommendation:** Migrate AI audit (and any other callers) to `incrementAiUsage`; add copy to auth + `canUseAiTools` + `incrementAiUsage`; deprecate or wrap `recordAIUsage`.

---

## 6. Rate limiting coverage

| Route / area | Rate limit | Notes |
|--------------|------------|--------|
| auth/login, register, me | rateLimitAuth (10/min) | ✅ |
| register-preference | rateLimitRegistration (5/min) | ✅ |
| contact, calculators/record, reports/pdf, analytics/event, analytics/visit, newsletter | rateLimitSensitive (20/min) or rateLimit (60) | ✅ |
| plans | rateLimit (60/min) | ✅ |
| All ai/* (website-audit, copy, audit, marketing, landing, seo, competitor, funnel, builder) | rateLimitAi (20/min) | ✅ |
| preview, review | Inline Map-based | ✅ (custom) |
| **notifications** | ❌ | GET; could add per-user limit. |
| **onboarding/complete** | ❌ | POST; could use rateLimitSensitive. |
| **deploy** | ❌ | requireUser only. |
| **health** | ❌ | Intended. |
| **stripe webhook** | N/A (signature) | ✅ |

**Recommendation:** Add `rateLimitSensitive` (or similar) to notifications GET and onboarding/complete POST to reduce abuse; optional for deploy.

---

## 7. Tenant isolation

| Area | Scoping | Result |
|------|---------|--------|
| reports/audit-pdf | `report.lead.email === user.email` | ✅ |
| notifications | `getNotificationsForUser(user.id)` | ✅ |
| onboarding/complete | Update `User` by `user.id` | ✅ |
| Stripe checkout/portal | metadata/lookup by `user.id` | ✅ |
| portal/settings/newsletter, portal/support | `user.id` → client/project | ✅ |
| usage, audit-limits, notifications | Queries by `userId` | ✅ |
| Admin APIs | No tenant scope (intended) | ✅ |
| review route | Token-based; ensure no cross-tenant leak | ⚠️ Verify token ties to single project |

No critical gaps identified; review route should be verified that token is single-use and scoped to one project.

---

## 8. Prisma query performance

| Finding | Location | Risk |
|---------|----------|------|
| findMany without take | admin/newsletter (subscribers), admin/leads, admin/invoices, admin/content, admin/maintenance (logs), modules/crm, modules/analytics | Medium: large tables could return many rows. |
| findMany with take | admin/clients (take: 50), admin/packages | ✅ |
| Indexes | schema has @@index on userId, clientId, createdAt, event, etc. | ✅ |
| N+1 | No obvious N+1 in critical paths; some admin lists use include (e.g. clients with lead). | Low |

**Recommendation:** Add `take` (and optionally `orderBy`) to admin newsletter, leads, invoices, content, maintenance; add pagination or cursor for large admin lists.

---

## 9. Caching strategy

| Usage | Implementation |
|-------|----------------|
| Dashboard analytics | `getOrSet(dashboardCacheKey(user.id), fn, 45_000)` in dashboard page. |
| Admin metrics | `getOrSet(ADMIN_METRICS_CACHE_KEY, fn, 45_000)` in admin/metrics. |
| Health | `getOrSet(HEALTH_CACHE_KEY, fn, 45_000)` in api/health. |
| Store | In-memory Map in lib/cache; TTL 45s; not shared across instances. |

Appropriate for current scale. For multi-instance, consider Redis (or similar) for cache and rate limits.

---

## 10. Error handling

| Pattern | Routes |
|---------|--------|
| handleApiError in catch | contact, calculators/record (only logger.error + 500), ai/*, stripe, onboarding, reports/pdf, analytics/event, plans, auth/me, register-preference, admin/leads | Most use it. |
| logger.error + manual 500 | admin/clients, admin/newsletter, admin/maintenance, admin/convert-lead, admin/content, admin/invoices, admin/projects, admin/packages, portal/settings/newsletter, portal/support, deploy, preview, review, analytics/visit, newsletter/subscribe, auth/logout | No handleApiError. |
| **notifications** | On error returns 200 with `{ notifications: [] }`; no log, no 500. | Bug: errors swallowed. |

**Recommendation:** Use `handleApiError` (or at least log + return 500) in all API catch blocks; fix notifications to log and return 500 on failure.

---

## 11. Code duplication

| Area | Duplication |
|------|-------------|
| AI route pattern | Every AI route repeats: validateOrigin → rateLimitAi → getCurrentUser → dbUser + canUseAiTools → body parse → module call → incrementAiUsage → handleApiError. Could be a shared `withAiRoute(handler)` or middleware. |
| Admin route pattern | requireUser("admin") + try/catch + logger.error + 500 repeated in many admin routes. |
| Rate limit + origin | Repeated blocks across routes; could be a small wrapper. |

**Recommendation:** Extract a shared `withAiRoute` (or similar) and standardize admin error handling to reduce duplication and drift.

---

## 12. Dead code

| Item | Notes |
|------|--------|
| lib/auth.validateCsrf | No-op; callers (admin packages, content) believe they have CSRF. Remove or delegate to lib/csrf. |
| lib/ai.ts | Re-exports openai, ai-website-audit, recordAIUsage. Prefer importing from lib/openai and lib/usage directly. |
| Two AI usage systems | lib/ai/usage (recordAIUsage) vs lib/usage (incrementAiUsage). Consolidate on lib/usage. |

No large dead modules found; cleanup is incremental.

---

## Prioritized action list

### P0 — Before production (critical)

- [ ] **Notifications route:** On error, log and return 500 (or use handleApiError); do not return 200 with empty array.

### P1 — High (security & consistency)

1. **AI copy:** Add `getCurrentUser`, `canUseAiTools(dbUser)`, and `incrementAiUsage(user.id, "copy")`; require authenticated user with plan that includes AI.
2. **AI audit (legacy):** Add `canUseAiTools(dbUser)` and switch to `incrementAiUsage` (or document and keep recordAIUsage but align with plan limits).
3. **Unify AI usage:** Use only `lib/usage.incrementAiUsage` for all AI tools; migrate recordAIUsage callers and deprecate or thin-wrap lib/ai/usage.
4. **CSRF:** Use `lib/csrf.validateCsrf` in admin mutation routes (packages, content, projects) or remove no-op from auth.

### P2 — Medium (hardening & maintainability)

5. **API validation:** Add Zod schemas for AI request bodies (copy, audit, marketing, landing, seo, competitor, funnel, builder) and use safeParse; return 400 with message.
6. **Rate limiting:** Add rate limit to notifications GET (e.g. rateLimitSensitive per user) and onboarding/complete POST; optional for deploy.
7. **Origin validation:** Add validateOrigin to notifications, deploy, and (if desired) plans and analytics/visit.
8. **Error handling:** Use handleApiError (or log + 500) in all API catch blocks (admin routes, portal, deploy, preview, review, analytics/visit, newsletter, auth/logout); fix calculators/record to use handleApiError in catch.
9. **Prisma:** Add `take` (and ordering) to admin newsletter, leads, invoices, content, maintenance; consider pagination for large lists.

### P3 — Low (cleanup & scale)

10. **Code duplication:** Introduce shared `withAiRoute` (or similar) and standardize admin error handling.
11. **Dead code:** Remove or replace auth.validateCsrf no-op; prefer direct imports over lib/ai.ts re-exports.
12. **Multi-instance:** Document or add Redis (or similar) for rate limit and lockout stores (and optionally cache) when scaling to multiple instances.

---

## Summary table

| Category | Status | Priority |
|----------|--------|----------|
| Security (auth, origin, CSRF) | ⚠️ Gaps (origin on some routes; CSRF no-op) | P1 |
| RBAC | ✅ Solid (admin + canUseAiTools on most AI) | — |
| API validation | ⚠️ Only contact + calculators/record use Zod | P2 |
| Stripe billing | ✅ Signature, idempotency, role/plan sync | — |
| OpenAI usage limits | ⚠️ Copy/audit not gated or unified | P1 |
| Rate limiting | ⚠️ Missing on notifications, onboarding, deploy | P2 |
| Tenant isolation | ✅ Scoped by userId/clientId | — |
| Prisma performance | ⚠️ Some findMany without take | P2 |
| Caching | ✅ Dashboard, admin metrics, health (45s) | — |
| Error handling | ⚠️ Notifications swallow errors; many routes skip handleApiError | P0/P2 |
| Duplication | ⚠️ AI and admin patterns repeated | P3 |
| Dead code | ⚠️ validateCsrf no-op; two usage systems | P1/P3 |

---

*Audit generated from full repository scan. Re-run after applying changes.*
