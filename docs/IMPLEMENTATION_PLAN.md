# VDB Digital — Structured Implementation Plan

**Lead engineer roadmap for turning VDB Digital into a scalable SaaS platform.**  
**Brand:** VDB Digital · **Legal entity:** VDB Digital Software.

---

## Executive summary

The codebase already has a strong foundation: Next.js App Router, Supabase Auth, Prisma + PostgreSQL, Stripe (checkout + webhooks + customer portal), dashboard, admin panel, AI tools, business calculators (partial), and role-based access. This plan focuses on **hardening, completing missing pieces, and scaling** without breaking existing behaviour.

**Rules enforced:**
- Never expose secrets; `/private` is in `.gitignore` and must not be committed.
- Follow Next.js SaaS best practices.
- Use existing folders: `modules/`, `docs/`, `private/`, `lib/`.

---

## Phase 1: Security & RBAC hardening

**Goal:** Centralise permissions and ensure every protected route/API is consistently guarded.

| Task | Description | Priority |
|------|-------------|----------|
| 1.1 | Add **permission matrix** in `lib/auth.ts` or `lib/permissions.ts`: map roles (lead, pro, customer, admin) to allowed routes and API actions. | High |
| 1.2 | **Middleware:** Add role check for `/admin` (redirect non-admins to `/dashboard` with 403). Currently only “logged in” is checked. | High |
| 1.3 | **Audit admin APIs:** Ensure every route under `app/api/admin/*` uses `requireUser("admin")` and returns 403 when not admin. (Current scan: they do; document and add a test or checklist.) | Medium |
| 1.4 | **Dashboard/Portal APIs:** Ensure dashboard and portal APIs use `requireUser()` and optionally restrict by role (e.g. customer-only for portal project list). | Medium |
| 1.5 | **Document RBAC** in `docs/RBAC.md`: who can access what (dashboard vs portal vs admin). | Low |

**Deliverables:** `lib/permissions.ts` (or extended `lib/auth.ts`), middleware update, `docs/RBAC.md`.

---

## Phase 2: Folder architecture & private/docs

**Goal:** Clarify structure and ensure `private/` is used for secrets and internal material only.

| Task | Description | Priority |
|------|-------------|----------|
| 2.1 | **Create `private/`** (if not present): add `private/README.md` stating “Never commit; contains secrets/internal docs.” Ensure `.gitignore` contains `/private` (done). | High |
| 2.2 | **`modules/`:** Keep feature-oriented structure. Add a **modules index** (`modules/README.md` or `modules/index.ts`) listing: ai-audit, ai-copy, ai-builder, seo-analyzer, competitor-analyzer, funnel-generator, crm, analytics, deploy. Document where new features should live. | Medium |
| 2.3 | **`lib/`:** Group by domain in docs (auth, stripe, ai, calculators, security, email). No mandatory renames; document in `docs/STRUCTURE.md`. | Low |
| 2.4 | **`docs/`:** Add this implementation plan; keep ARCHITECTURE.md and STRUCTURE.md as single source of truth. Optionally add `docs/PRIVATE.md` (in repo) explaining that sensitive runbooks live in `private/`. | Medium |

**Deliverables:** `private/README.md`, `modules/README.md`, updated `docs/STRUCTURE.md`.

---

## Phase 3: Dashboard system improvements

**Goal:** Make the dashboard the single place for users to see subscription state, usage, and next actions.

| Task | Description | Priority |
|------|-------------|----------|
| 3.1 | **Subscription & plan on dashboard:** From `User` (and Stripe webhook state) show current plan (Free/Pro/Agency), renewal, and “Manage billing” (link to Stripe Customer Portal). Reuse existing `getCurrentUser` + Prisma `User.planId`, `stripeSubscriptionId`. | High |
| 3.2 | **Usage at a glance:** Show audit usage (e.g. `auditCountCurrentMonth` vs plan limit), and optionally AI usage from `AIUsage` (this month). | High |
| 3.3 | **Dashboard role cards:** Already present; ensure copy and `roles` arrays stay in sync with `lib/permissions.ts`. | Medium |
| 3.4 | **Billing page:** Current `/dashboard/billing` redirects to Stripe portal. Add a short “Subscription” section: plan name, status, next billing date (from Stripe or DB cache), and link to portal. | Medium |

**Deliverables:** Dashboard home and billing page enhancements; optional small “usage” component in `components/dashboard/`.

---

## Phase 4: Admin panel hardening

**Goal:** Admin is already comprehensive; ensure consistency, security, and clarity.

| Task | Description | Priority |
|------|-------------|----------|
| 4.1 | **Layout guard:** Admin layout already uses `requireUser("admin")` and redirects. Ensure 403 is returned for API calls and that non-admins never see admin UI (no flash of content). | High |
| 4.2 | **Admin API checklist:** Document in `docs/ADMIN_API.md` (or in STRUCTURE) that all `app/api/admin/*` handlers must call `requireUser("admin")` first. | Medium |
| 4.3 | **Subscription overview (admin):** Optional: list of users with active Stripe subscriptions (from `User.stripeSubscriptionId` / Plan) for support. | Low |

**Deliverables:** Optional `docs/ADMIN_API.md`, any layout/redirect tweaks.

---

## Phase 5: AI tools modules

**Goal:** AI tools already exist; ensure they are modular, limited by plan, and easy to extend.

| Task | Description | Priority |
|------|-------------|----------|
| 5.1 | **Centralise AI usage and limits:** Use `lib/ai/usage.ts` and `lib/audit-limits.ts` in all AI routes. Ensure every AI route checks plan/credits/audit limit before calling OpenAI. | High |
| 5.2 | **Module boundary:** Each AI feature (website-audit, copy, funnel, competitor, builder) lives under `modules/` with logic + types; API routes in `app/api/ai/*` remain thin and call into modules. Document in `modules/README.md`. | Medium |
| 5.3 | **Error and limit messaging:** When limit reached, return clear JSON (e.g. `limitExceeded: true`) so dashboard can show upgrade CTA. | Medium |

**Deliverables:** Consistent usage/limit checks in AI routes; optional `modules/ai/README.md`.

---

## Phase 6: Business calculators completion

**Goal:** All seven calculator types have logic and recording.

| Task | Description | Priority |
|------|-------------|----------|
| 6.1 | **Implement missing calculator logic** in `lib/calculators/`: `priceIncrease.ts`, `subscriptionVsOneTime.ts`, `freelancerRate.ts`, `financeCheck.ts`. Match existing pattern (e.g. `roi.ts`, `breakEven.ts`): input types, compute, return result object. | High |
| 6.2 | **Recording:** Keep using `lib/calculators/record.ts` for all types. Ensure dashboard calculators UI sends the correct `type` and payload to `POST /api/calculators/record`. | Medium |
| 6.3 | **Dashboard calculators page:** List all seven tools; link each to a form that calls the correct logic (and record). | Medium |

**Deliverables:** Four new lib files under `lib/calculators/`, and dashboard wiring for all seven types.

---

## Phase 7: Stripe subscriptions & billing UX

**Goal:** Subscriptions already work (checkout, webhook, customer portal). Improve visibility and robustness.

| Task | Description | Priority |
|------|-------------|----------|
| 7.1 | **Webhook idempotency:** Already using `ProcessedStripeEvent`; ensure all subscription lifecycle events (created, updated, deleted) update `User.planId`, `stripeSubscriptionId`, and `role` (e.g. pro/customer). Document in `docs/STRIPE.md`. | High |
| 7.2 | **Customer portal link:** Already at `/api/stripe/customer-portal`. Ensure dashboard billing/settings page uses it and shows “Manage subscription” clearly. | Medium |
| 7.3 | **Plans in DB:** Seed or ensure `Plan` table has Free, Pro, Agency with correct `name`, `price`, `credits`, `features`. Sync with Stripe Price IDs in env. | High |
| 7.4 | **Optional: billing history in app:** If needed, store minimal subscription events in DB (e.g. “Pro – renewed”) for “Billing history” section without calling Stripe API on every load. | Low |

**Deliverables:** `docs/STRIPE.md`, verified webhook handling, Plan seed/consistency.

---

## Phase 8: Scalable SaaS foundations

**Goal:** Prepare for multi-instance and growth without big rewrites.

| Task | Description | Priority |
|------|-------------|----------|
| 8.1 | **Rate limiting:** Current in-memory rate limits are per-instance. Document that for production at scale, use Redis (e.g. Upstash) and switch `lib/rateLimit.ts` to a Redis-backed implementation. Optional: implement Redis adapter behind same interface. | Medium |
| 8.2 | **Feature flags:** Optional env-based flags (e.g. `NEXT_PUBLIC_FEATURE_AI_COPY=true`) for gradual rollouts. Document in `lib/env.ts` or `docs/ARCHITECTURE.md`. | Low |
| 8.3 | **Tenant isolation:** Current model is single-tenant (user + client). Document that all queries must be scoped by `userId` or `clientId` where applicable; no global “list all users” outside admin. | Medium |
| 8.4 | **Health and readiness:** `/api/auth/health` exists; add optional `/api/health` that checks DB + optional Stripe connectivity for k8s/Vercel. | Low |

**Deliverables:** Documentation updates; optional Redis rate limit adapter and `/api/health`.

---

## Phase 9: Authentication & DX

**Goal:** Keep Supabase; improve security and optional OAuth.

| Task | Description | Priority |
|------|-------------|----------|
| 9.1 | **Login lockout:** Already implemented (e.g. 5 attempts → 15 min). Ensure `api/auth/login-failed` and `check-lockout` are used by login form. | High |
| 9.2 | **Passwords:** Rely on Supabase (hashing, policies). No plain-text passwords in Prisma; `User.password` is legacy/optional. Document. | Medium |
| 9.3 | **OAuth (optional):** Add Google (and optionally LinkedIn) in Supabase dashboard and expose “Sign in with Google” on login/register. Requires Supabase config + UI. | Low |
| 9.4 | **Email verification:** Supabase supports it; document whether new users must verify email before accessing dashboard (and enforce in middleware if desired). | Low |

**Deliverables:** Auth flow verification; optional OAuth; `docs/AUTH.md`.

---

## Implementation order (recommended)

1. **Phase 1** (RBAC & middleware) — prevents privilege escalation.
2. **Phase 2** (folders & private) — safe structure and no accidental commit of secrets.
3. **Phase 7** (Stripe docs & Plan seed) — revenue and correctness.
4. **Phase 6** (calculators) — complete existing scope.
5. **Phase 3** (dashboard UX) — user-facing clarity.
6. **Phase 5** (AI limits) — cost and fairness.
7. **Phase 4** (admin) — operational clarity.
8. **Phase 8** (scalability) — when moving to multi-instance.
9. **Phase 9** (auth DX) — incremental improvements.
10. **Phase 11** (launch readiness) — logging, audit log, email module, admin metrics.

---

## Phase 11: Launch readiness

**Goal:** Prepare for production: global error logging, audit trail, email module, admin metrics.

| Task | Description | Priority |
|------|-------------|----------|
| 11.1 | **Logger:** Improve `lib/logger.ts`; add `logError(context, error)`. Ensure API routes use it via `handleApiError`. | High |
| 11.2 | **Audit log:** Create `lib/auditLog.ts` and `AuditLog` model. Log: user_signup, plan_upgrade, ai_tool_used, calculator_used, admin_action. | High |
| 11.3 | **Email module:** Create `modules/email` with sendWelcomeEmail(user), sendUpgradeConfirmation(user), sendAuditReport(email, report). | Medium |
| 11.4 | **Admin metrics:** Create `/admin/metrics` — total/active users, Stripe revenue (est.), AI/calculator usage. | Medium |

**Deliverables:** `lib/logger.ts` (logError), `lib/auditLog.ts`, `AuditLog` in Prisma, `modules/email`, `app/admin/metrics/page.tsx`, `docs/AUDIT_LOG.md`.

---

## Phase 12: Production polish

**Goal:** Stability, performance, developer experience.

| Task | Description | Priority |
|------|-------------|----------|
| 12.1 | **Caching:** In-memory cache (30–60s) for dashboard analytics, admin metrics, health. | High |
| 12.2 | **API validation:** Zod in `lib/validation.ts`; use in contact, calculator record, and other routes. | High |
| 12.3 | **Error boundaries:** Dashboard, AI tools, calculator pages — user-friendly fallback + retry. | Medium |
| 12.4 | **Background tasks:** Email, audit log, AI usage aggregation do not block API responses (`runInBackground` / fire-and-forget). | Medium |
| 12.5 | **Docs:** Update `docs/ARCHITECTURE.md` — modules, API structure, billing flow, AI layer. | Low |

**Deliverables:** `lib/cache.ts`, `lib/validation.ts` (Zod), `lib/runInBackground.ts`, `app/dashboard/error.tsx`, `app/dashboard/ai-tools/error.tsx`, `app/dashboard/calculators/error.tsx`, updated ARCHITECTURE.md.

---

## File checklist (generated if missing)

| Item | Location | Status |
|------|----------|--------|
| Permission matrix / RBAC | `lib/permissions.ts` or `lib/auth.ts` | To add |
| RBAC documentation | `docs/RBAC.md` | To add |
| Private folder notice | `private/README.md` | To add |
| Modules index | `modules/README.md` | To add |
| Stripe flow documentation | `docs/STRIPE.md` | To add |
| Auth documentation | `docs/AUTH.md` | Optional |
| Admin API contract | `docs/ADMIN_API.md` | Optional |
| Calculator logic | `lib/calculators/priceIncrease.ts` etc. | 4 files to add |
| Health API | `app/api/health/route.ts` | Optional |

---

## Summary

- **Security first:** RBAC and middleware (Phase 1), then `private/` and structure (Phase 2).
- **Revenue and compliance:** Stripe docs and Plan seed (Phase 7).
- **Feature completeness:** Calculators (Phase 6), dashboard and AI limits (Phases 3, 5).
- **Scale and ops:** Phase 8 and 9 as needed.

All work keeps the **VDB Digital** brand and **VDB Digital Software** as legal entity, follows Next.js SaaS best practices, and avoids exposing secrets or committing `/private`.

---

*Last updated: implementation plan v1. Lead engineer: single source of truth for roadmap.*
