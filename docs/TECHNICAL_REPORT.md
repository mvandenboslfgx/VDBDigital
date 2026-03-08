# VDB Digital – Technical Report & Improvement Plan

**Project:** AI SaaS platform for website audits (SEO, performance, UX, conversion)  
**Stack:** Next.js (App Router), TypeScript, Prisma, Stripe, OpenAI, Tailwind, Zod  
**Report date:** Based on full codebase analysis. Only real files and patterns are referenced.

---

## 1. ARCHITECTURE

### 1.1 Folder structure

| Path | Responsibility |
|------|----------------|
| **`app/`** | Next.js App Router: routes, layouts, pages. Root `layout.tsx` (fonts, metadata, I18n, ChatWidget); `page.tsx` = landing. |
| **`app/dashboard/`** | Authenticated user dashboard: home, audits, ai-tools, calculators, reports, projects, billing, settings, account. Layout enforces non-admin redirect to dashboard; admin/owner → `/admin`. |
| **`app/admin/`** | Admin/owner area: layout checks `canAccessAdmin`, owner gets `OwnerSidebar`; owner-only routes (control-center, users, leads, finance, ai-usage, plans, analytics, system, logs) enforced in middleware. |
| **`app/portal/`** | Client portal (invoices, projects, files, support, review). |
| **`app/api/`** | API routes: auth (login, register, me, logout, health, etc.), stripe (checkout, portal, webhook), chat (send, messages, reply, status, presence), ai/* (audit, website-audit, copy, builder, seo-audit, etc.), admin/*, reports, health, locale, notifications, onboarding, plans, analytics, calculators. |
| **`lib/`** | Core: `prisma`, `auth`, `stripe`, `openai`, `plans`, `usage`, `cache`, `rateLimit`, `permissions`, `i18n`, `ai-website-audit`, `audit-limits`, `apiSecurity`, `apiSafeResponse`, `auditLog`, `mailer`, `logger`, `chat-presence`, `notifications`, etc. |
| **`components/`** | UI: `SiteShell`, `Navbar`, `LanguageSwitcher`, `I18nProvider`, `ui/` (Button, Input, Panel, etc.), `home/*` (Hero, WebsiteScanSection, ProblemSection, PricingStrip, FAQ, etc.), `chat/*` (ChatWidget, ChatWindow, OfflineForm), `dashboard/*` (DashboardNav, AuditToolClient, NotificationBell), `admin/*` (OwnerSidebar, MetricCard, PlanEditor, AdminChatClient). |
| **`modules/`** | Feature modules: `chat`, `leads` (auditLead), `ai`, `ai-audit`, `ai-builder`, `ai-copy`, `calculators`, `seo-analyzer`, `analytics`, `crm`, `funnel-generator`, `competitor-analyzer`, `deploy`, `email`. Typically `logic.ts`, `api.ts`, `types.ts`, components. |
| **`prisma/`** | Schema, migrations, seed (plans: free, pro, business, agency). |
| **`locales/`** | i18n: `nl`, `en`, `de` with `common.json`. |
| **`styles/`** | `globals.css` (Tailwind, design tokens, glass panels). |

### 1.2 API route structure

- **Auth:** `/api/auth/login`, `register`, `me`, `logout`, `health`, `check-lockout`, `login-failed`, `register-preference`.
- **Stripe:** `/api/stripe/create-checkout-session` (POST, plan in body), `customer-portal` (POST), `webhook` (POST, raw body + signature).
- **AI / Audit:** `/api/ai/website-audit` (POST: url, email, name, company, preview); `/api/ai/audit`, `copy`, `builder`, `seo-audit`, etc.
- **Chat:** `/api/chat/send`, `messages`, `reply`, `status`, `presence`.
- **Admin:** `/api/admin/users/update`, `delete`, `leads`, `convert-lead`, `leads/send-email`, `leads/delete`, `plans/update`, etc.
- **Other:** `/api/health` (cached), `/api/locale` (POST/GET), `/api/notifications`, `/api/plans`, `/api/reports/audit-pdf`.

### 1.3 Database structure (summary)

- **Identity & billing:** `User` (id from Supabase, role, planId, stripeCustomerId, stripeSubscriptionId, auditCountCurrentMonth, disabledAt), `Plan` (name, price, credits, features JSON).
- **Leads & audits:** `Lead`, `AuditResult` (legacy), `AuditReport` (seo/perf/ux/conv scores, summary), `AuditHistory` (per-user scan history, links to AuditReport), `LeadScore`.
- **Usage & events:** `AIUsage`, `CalculatorResult`, `UsageEvent`, `AnalyticsEvent`.
- **Chat:** `ChatConversation`, `ChatMessage`.
- **Agency/portal:** `Client`, `Website`, `Project`, `Task`, `Invoice`, `Review`, `ProjectFile`, `ProjectRequest`, `ReviewToken`, `MaintenanceLog`.
- **System:** `ProcessedStripeEvent` (webhook idempotency), `AuditLog`, `ContentBlock`, `PackageConfig`, `NewsletterSubscriber`, `RegistrationNewsletter`.

### 1.4 How features interact

- **Audit flow:** User/visitor calls `/api/ai/website-audit` → `lib/ai-website-audit` (fetch HTML, signals, scores, optional PageSpeed, OpenAI summary) → if full report: `captureAuditLead` (Lead, AuditReport, optional AuditHistory + LeadScore + incrementAuditCount), email sent. Dashboard shows reports by lead email; report detail by `report.lead.email === user.email`.
- **Billing:** Checkout session created with `metadata.userId`; webhook updates User (planId, role, stripe ids). Usage enforced via `lib/usage` + `lib/plans` and audit count via `lib/audit-limits`.
- **Auth:** Supabase session; `getCurrentUser()` syncs User in DB, assigns owner/admin/lead; middleware protects `/dashboard`, `/admin`, `/portal` and owner-only paths.
- **Chat:** Widget uses `/api/chat/status`, `send`, `messages`; admin uses `reply`, `presence`; `lib/chat-presence` in-memory for “admin online”.

---

## 2. DATABASE (PRISMA)

### 2.1 Models

- **User:** Supabase id, email, role (lead|customer|pro|admin|owner), planId, stripe ids, auditCountCurrentMonth, lastAuditResetAt, disabledAt, onboardingCompleted, companyName, industry, newsletterOptIn. Relations: Plan, Client, AIUsage, CalculatorResult, LeadScore, AuditHistory, UsageEvent.
- **Plan:** name (unique), price (cents), credits (nullable = unlimited), features (JSON), active.
- **Lead:** email (unique), name, company, message, website, source, UTM, leadScore, convertedAt. Relations: Client, AuditResult, AuditReport.
- **AuditReport:** leadId, url, seoScore, perfScore, uxScore, convScore, summary (text). Indexes: leadId, createdAt.
- **AuditHistory:** userId, website, scores, summary, auditReportId. Links dashboard “my scans” to report.
- **AIUsage:** userId, tool, tokens, creditsUsed.
- **ChatConversation:** visitorId, visitorEmail, visitorName, subject, status (open|closed). ChatMessage: conversationId, fromAdmin, authorId, body, readAt.
- **ProcessedStripeEvent:** id (event id) for webhook idempotency.
- **AuditLog:** event, userId, metadata for audit trail.

### 2.2 Relationships

- User → Plan (many-to-one); User → Client (one-to-one); Lead → Client (one-to-one); Lead → AuditReport (one-to-many); User → AuditHistory (one-to-many), AuditHistory.auditReportId → AuditReport.
- Client → Website, Invoice, Project; Project → Task, ProjectFile, ProjectRequest, ReviewToken, Review.
- ChatConversation → ChatMessage (one-to-many).

### 2.3 SaaS design quality

- **Strengths:** Clear separation of Lead vs User; AuditReport + AuditHistory support both lead capture and logged-in user history; Plan with features JSON allows flexibility; ProcessedStripeEvent prevents duplicate webhook handling; role and planId on User drive access and limits.
- **Gaps:** No explicit Subscription or StripeSubscription table (only stripeSubscriptionId on User); audit limits live in code (audit-limits.ts) and User.auditCountCurrentMonth (month reset logic in app). Plan features (e.g. aiLimit, auditsPerMonth) are partly in DB (seed) and partly in `lib/plans` (code); slight duplication.

### 2.4 Potential improvements

- Add `StripeSubscription` or at least store current price_id on User for more robust plan resolution.
- Consider indexing (userId, createdAt) on AuditHistory if report lists grow.
- Unify plan limits: either derive from DB Plan.features everywhere or document that `lib/plans` is source of truth for limits and keep seed in sync.
- Add soft delete or status on Lead/User where needed for compliance (e.g. right to be forgotten).

---

## 3. STRIPE INTEGRATION

### 3.1 Config

- **`lib/stripe.ts`:** Single server-side Stripe instance from `STRIPE_SECRET_KEY`; `STRIPE_WEBHOOK_SECRET`; `PRICE_IDS` (pro, business, agency from env).
- **Checkout (`app/api/stripe/create-checkout-session/route.ts`):** Requires `getCurrentUser()`. Reads `body.plan` (pro|business|agency), maps to PRICE_IDS; reuses stripeCustomerId if present; sets metadata.userId and subscription_data.metadata.userId; success_url → `/dashboard/billing?session_id=...`, cancel_url → `/pricing`.

### 3.2 Webhook

- **`app/api/stripe/webhook/route.ts`:** Reads raw body, verifies signature with `stripe.webhooks.constructEvent(body, sig, webhookSecret)`. Returns 400 on invalid signature. Checks `ProcessedStripeEvent` for idempotency before processing. Handles:
  - `checkout.session.completed`: resolves plan from priceId (pro/business/agency), updates User (stripeCustomerId, stripeSubscriptionId, planId, role), records usage event, audit log.
  - `customer.subscription.updated`: same plan resolution, updateMany by stripeSubscriptionId.
  - `customer.subscription.deleted`: set planId to free, stripeSubscriptionId null, role lead.
- After success, inserts `ProcessedStripeEvent`; on unique violation, returns 200 (race-safe).

### 3.3 Security

- **Webhook:** Signature verification; no trust of client-supplied payload without verification.
- **Idempotency:** ProcessedStripeEvent ensures each event id is processed once.
- **Checkout:** Authenticated; userId in server-controlled metadata.

### 3.4 Gaps

- **Create-checkout:** `success_url` uses `origin` from request or VERCEL_URL; SITE_URL is not used for success_url (baseUrl logic uses VERCEL_URL first). Prefer SITE_URL when set.
- **Subscription updated:** If Stripe sends a price change (e.g. new price id), fallback assigns first matching plan (agency → business → pro); consider explicit mapping or logging unknown price ids.
- **Customer portal:** Exists at `/api/stripe/customer-portal`; no explicit check that the session belongs to the current user (relies on Stripe session); ensure cookie/session is sent when redirecting.

---

## 4. AI WEBSITE AUDIT ENGINE

### 4.1 Flow

- **`lib/ai-website-audit.ts`:** `fetchAndParseSignals` (normalize URL, fetch HTML, Cheerio: title, meta description, h1, heading count, body length, link/img/script count) → `computeScores` (deterministic rules) → optional `fetchPageSpeedScore` (when PAGESPEED_ENABLED) → `generateAuditSummary` (OpenAI, Dutch, full or short).
- **`app/api/ai/website-audit/route.ts`:** Origin check, rate limit (AI), URL sanitization and prompt-injection check, audit limit (logged-in user), then `runFullWebsiteAudit`; on full report: `captureAuditLead`, send email.

### 4.2 Scoring logic

- **SEO (base 60):** +title length, +meta description length/range, +single h1, +heading count.
- **Performance (base 70):** penalties for many scripts, images, long page.
- **UX (base 65):** +headings, +links in range, +body length in range.
- **Conversion (base 60):** +links, +title, +meta, +h1.
- PageSpeed score (0–100) is averaged with computed perfScore when enabled.

### 4.3 AI usage

- One OpenAI call per audit (summary). Model: gpt-4o-mini. No token counting in this path (AIUsage exists but website-audit route does not call incrementAiUsage in the read code; other AI routes do). Recommend recording AIUsage in website-audit for consistency and limits.

### 4.4 Suggestions

- **Accuracy:** Add meta og:image, canonical, hreflang; check for lazy-loaded content (e.g. signals for above-the-fold size). Optional: run Lighthouse/PageSpeed for accessibility and best-practices categories and fold into scores.
- **Signals:** Form count, CTA button patterns, internal vs external links, structured data (JSON-LD) presence.
- **CRO:** Dedicated “conversion” signals: primary CTA visibility, form fields count, trust elements (reviews, guarantees), urgency/copy length.
- **UX:** Simple accessibility proxy: alt on images, form labels; heading hierarchy (h1 → h2 → h3). Optional: Core Web Vitals when PageSpeed is enabled (LCP, FID, CLS from API).
- **Report:** Structured sections (problems, improvements, growth) are parsed in `parse-report-sections`; consider asking the model for JSON for more reliable parsing.

---

## 5. PERFORMANCE

### 5.1 Next.js and dynamic imports

- Landing (`app/page.tsx`): Hero and WebsiteScanSection static; rest loaded with `dynamic(..., { ssr: true })` (good for code splitting).
- Chat: `ChatWidgetLazy` uses `dynamic(..., { ssr: false })` for the widget (avoids SSR/hydration issues).

### 5.2 Caching

- **`lib/cache.ts`:** In-memory, TTL 45s. Used for dashboard data (`dashboardCacheKey(userId)`), health (`HEALTH_CACHE_KEY`). Not shared across instances.
- **Health route:** `getOrSet(HEALTH_CACHE_KEY, ..., 45_000)`.

### 5.3 Database queries

- Dashboard home: Single `getOrSet` with Promise.all (reports, usage, aiByTool, recentActivity). Reports: `auditReport.findMany` by lead.email.
- Usage: Parallel count for AI, calculator, and client/project count. No N+1 in the sampled paths.
- Webhook: Multiple plan lookups per event; could be cached (e.g. in-memory map of priceId → plan) to reduce DB round-trips.

### 5.4 API performance

- Audit: One HTTP fetch to target URL, optional PageSpeed (5–10s), one OpenAI call. Dominant cost is external I/O.
- Rate limiting is in-memory (no Redis); fine for single instance.

### 5.5 Bundles

- Framer Motion, Cheerio, pdf-lib, Stripe are used; no obvious heavy client bundles except possibly Three/Leva (if used on landing). Chat and heavy sections are dynamically imported.

### 5.6 Recommendations

- Add React cache() or unstable_cache for expensive server reads where appropriate (e.g. plan list).
- Consider Redis (or Vercel KV) for cache and rate limit store when scaling to multiple instances.
- Ensure audit and AI routes record AIUsage so usage-based limits and analytics are correct.

---

## 6. SECURITY

### 6.1 Authentication

- Supabase Auth; session via cookies. `getCurrentUser()` validates JWT server-side and syncs/creates User in DB. No client-supplied identity trusted.

### 6.2 Authorization

- **Middleware:** Protects `/dashboard`, `/portal`, `/admin`; for `/admin` fetches role from `/api/auth/me`, enforces owner on OWNER_ROUTES, else admin or owner.
- **Pages/layouts:** `requireUser()`, `requireOwner()` used on server components; API routes use `getCurrentUser()` and role checks.
- **Permissions:** Centralized in `lib/permissions.ts` (isOwner, canAccessAdmin, isOwnerPath, etc.).

### 6.3 API protection

- **Origin/referer:** `validateOrigin(request)` in website-audit and likely other public APIs; allowlist (localhost, vdb.digital, SITE_URL, VERCEL_URL).
- **Input:** `sanitizeString`, `sanitizeEmail`, `sanitizeWebsiteUrl`, `validateEmailFormat`, `containsPromptInjection` from `lib/apiSecurity`. URL and body validated before audit.
- **Rate limiting:** `rateLimitAuth`, `rateLimitAi`, `rateLimitAudit`, etc., keyed by IP (getClientKey). Failed-login lockout (5 → 15 min) via `recordFailedLogin` / `isLoginLockedOut`.

### 6.4 Stripe webhook

- Signature verification with raw body; idempotency via ProcessedStripeEvent. No skipping of verification.

### 6.5 Environment

- Secrets in env; `.env.example` documents vars without values. NEXT_PUBLIC_* only for non-secret config (Supabase URL/anon, Stripe publishable if used).

### 6.6 Headers (next.config.mjs)

- CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS, Permissions-Policy. CSP allows 'unsafe-inline' and 'unsafe-eval' for scripts (common with Next.js); consider tightening if possible.

### 6.7 Risks

- Middleware calls `/api/auth/me` on every admin request (extra round-trip); consider passing role in signed cookie or token to avoid internal fetch.
- Rate limit store is in-memory: per-instance, resets on deploy; distributed abuse possible with many instances.
- Owner emails: hardcoded fallback in auth; ensure OWNER_EMAILS is set in production and not committed.

---

## 7. UX / PRODUCT DESIGN

### 7.1 Landing

- Sections: Hero, Problem, Solution, Website Scan (CTA), Product Features, How it works, Dashboard Preview, Pricing (4 tiers), Testimonials, FAQ, Final CTA. All Dutch. Good conversion structure.
- `SiteShell` wraps content; Navbar with language switcher; Chat widget lazy-loaded.

### 7.2 Dashboard

- Role-based nav (DashboardNav): Dashboard, Scans, AI Tools, Calculators, Reports, Projects, Facturatie, Settings. Home shows metrics (from last report if any), usage widget, recent activity, recent scans, upgrade CTA for leads.
- Audits: AuditToolClient with URL + email (prefilled when logged in), preview then unlock full report; upgrade modal on limit.

### 7.3 Onboarding

- Dashboard onboarding block when `!onboardingCompleted`; onboarding API and wizard exist.

### 7.4 Conversion funnel

- Landing → Scan (preview) → Email for full report → Account/Dashboard → Billing/Upgrade. Stripe Checkout and portal used for paid plans.

### 7.5 Suggestions

- Add explicit “History” in nav for “past scans” (already under Reports; could rename or add shortcut).
- After full report unlock, redirect or deep-link to report page so the user sees the report immediately.
- A/B test hero CTA (e.g. “Start analyse” vs “Gratis scan”).
- Use premium patterns: micro-animations on cards, skeleton loaders on dashboard, empty states with clear next step.

---

## 8. CODE QUALITY

### 8.1 Modularity

- Clear split: app (routes), lib (core), components (UI), modules (features). Chat and leads in modules; audit engine in lib.

### 8.2 Maintainability

- Types (TypeScript) used consistently; PlanKey, PlanConfig, AuditSignals, etc. Central config in lib/plans and lib/audit-limits.
- Some duplication: Stripe price resolution in webhook (two similar blocks for checkout vs subscription.updated); could be a shared helper.

### 8.3 Duplication

- Plan resolution by priceId repeated in webhook; create-checkout PRICE_IDS duplicated (lib/stripe vs route). Recommend single source (lib/stripe) and a `resolvePlanFromPriceId(priceId)` used by webhook.
- BASE_ORIGINS in apiSecurity hardcoded; could include SITE_URL at runtime.

### 8.4 Naming

- Consistent: getCurrentUser, requireOwner, checkUsageLimit, runFullWebsiteAudit, captureAuditLead. Dutch in user-facing strings.

### 8.5 Error handling

- `handleApiError` in API routes; logger used for failures. Audit route returns 429 on limit, 400 on validation. Webhook returns 500 on handler error after signature check, then rethrows so event is not marked processed (idempotency create after success).

---

## 9. SCALABILITY

### 9.1 10k users

- Single Postgres and single app instance: DB connection pool and query patterns (indexed lookups, limited lists) are adequate. In-memory cache and rate limit work. Stripe webhook and audit flow are single-request. Bottleneck: OpenAI and optional PageSpeed per audit; consider queue for audits if volume grows.

### 9.2 100k users

- **DB:** Need connection pooling (e.g. PgBouncer); consider read replicas for dashboard/report reads. Indexes on (userId, createdAt), (leadId, createdAt), (email) already in place.
- **App:** Multiple instances require shared rate limit and cache (Redis/Upstash). Middleware calling /api/auth/me adds latency; consider edge-friendly auth (e.g. JWT in cookie with role).
- **Stripe:** Webhook must stay idempotent; ProcessedStripeEvent is sufficient; ensure DB write capacity.
- **Audit:** Queue (e.g. background job) for runFullWebsiteAudit; return job id and poll or webhook for completion so request timeout and cost are decoupled.

### 9.3 Heavy AI usage

- Rate limit per IP and per user (AI_MAX_PER_MINUTE); AIUsage table for per-user caps. For very high volume: per-user quota in Redis, batch or queue OpenAI calls, consider streaming for summary to improve perceived latency.

---

## 10. FINAL REPORT

### A. Architecture overview

- Next.js App Router with clear separation: app (routes/layouts), lib (auth, billing, audit, usage, security), components (shared + feature), modules (chat, leads, calculators, etc.). Single API surface under `/api` (auth, stripe, chat, ai, admin, health, locale). Database: Postgres via Prisma with User, Plan, Lead, AuditReport, AuditHistory, AIUsage, Chat*, ProcessedStripeEvent, AuditLog. Auth: Supabase; billing: Stripe (checkout + webhook); audit: custom engine + optional PageSpeed + OpenAI summary.

### B. Strengths

- Coherent SaaS model: roles, plans, usage and audit limits, Stripe sync, idempotent webhooks.
- Security: origin validation, input sanitization, rate limiting, failed-login lockout, webhook signature verification, secure headers.
- Audit engine: deterministic scores + optional PageSpeed + AI summary; lead capture and user history integrated.
- i18n (NL/EN/DE), chat (widget + admin), admin/owner separation, health endpoint, deploy checklist (docs/DEPLOY.md).
- TypeScript and central config (plans, permissions, audit-limits) improve maintainability.

### C. Weaknesses

- Cache and rate limit are in-memory (not shared across instances).
- Plan/price resolution duplicated in webhook; create-checkout success_url prefers VERCEL_URL over SITE_URL.
- AIUsage may not be recorded in website-audit route (inconsistency with other AI routes).
- Audit scoring is heuristic-only unless PageSpeed enabled; no Core Web Vitals or accessibility in core flow.
- Middleware depends on internal /api/auth/me call for admin routes.
- Zustand appears only as transitive dependency (e.g. leva); not used in app code for global state.

### D. Security risks

- **Low:** Hardcoded owner emails if OWNER_EMAILS not set; BASE_ORIGINS allowlist should include SITE_URL.
- **Low:** CSP allows unsafe-inline/unsafe-eval (typical for Next.js).
- **Medium:** In-memory rate limit bypassable with many instances; recommend Redis for production at scale.
- **Low:** Ensure Stripe customer portal and checkout success_url use intended domain (SITE_URL).

### E. Performance bottlenecks

- Audit: external fetch + optional PageSpeed (5–10s) + OpenAI; total time can be 10–20s.
- Dashboard: cached 45s; first request after cache miss does several DB queries (acceptable).
- Webhook: multiple plan fetches per event; small but could be cached.
- No database connection pooling config visible in schema (relies on host/default pool).

### F. Quick improvements (1 day)

1. Record AIUsage in `/api/ai/website-audit` when OpenAI is called (tool e.g. `website-audit`).
2. Use SITE_URL for Stripe success_url/cancel_url when set; fallback to origin/VERCEL_URL.
3. Extract `resolvePlanFromPriceId(priceId)` in lib (or stripe helper) and use in webhook for both checkout.session.completed and subscription.updated.
4. Add SITE_URL to validateOrigin allowlist when set (already partially done via separate check; ensure BASE_ORIGINS or same logic).
5. Document in DEPLOY.md: set OWNER_EMAILS in production; avoid relying on default owner list.

### G. Medium improvements (1 week)

1. Add Redis (or Vercel KV) for cache and rate limit store; switch lib/cache and lib/rateLimit to use it when REDIS_URL (or similar) is set.
2. Add Core Web Vitals or accessibility category when PageSpeed is enabled; expose in report (e.g. LCP, FID, CLS, a11y score).
3. Enrich audit signals: canonical, og:image, form count, JSON-LD; add simple a11y proxy (alt count, label presence).
4. Refactor webhook: single function that returns { planId, role } from priceId and use in both event handlers; add logging for unknown price ids.
5. Dashboard: after “unlock full report”, redirect to `/dashboard/reports/[reportId]` when report id is returned.
6. Add optional `unstable_cache` or React cache() for getActivePlans() and health to reduce DB/CPU on repeated requests.

### H. Major upgrades (1 month)

1. **Audit queue:** Background job (e.g. Inngest, Vercel Queue, or Bull) for runFullWebsiteAudit; API returns job id; frontend polls or uses SSE/webhook for “report ready”; store report id on job completion and notify user.
2. **Multi-instance production:** Redis for rate limit, cache, and optional session store; edge-compatible auth (e.g. JWT with role in cookie) to avoid middleware → /api/auth/me.
3. **Stripe robustness:** Store current price_id (or product/price metadata) on User or new Subscription table; handle plan changes and proration via webhook; add Stripe Customer Portal session validation (e.g. ensure return URL and customer match).
4. **Audit engine v2:** Structured JSON output from OpenAI (problems, improvements, growth_estimate); optional Lighthouse CI for performance/accessibility/best-practices; CRO signals (CTA, forms, trust) and weighted conversion score.
5. **Observability:** Structured logging with request id; metrics (e.g. audit duration, OpenAI tokens, errors) to Datadog/Logtail/Vercel Analytics; alerting on webhook failures and health degradation.

### I. SaaS maturity score: **7.0 / 10**

- **Rationale:** Strong foundation: auth, roles, plans, Stripe, usage and audit limits, audit engine, chat, i18n, admin/owner, health. Gaps: no distributed cache/rate limit, no audit queue, minor Stripe/config duplication, AIUsage possibly missing in one route, heuristic-only scoring without PageSpeed. At 10k users with one instance the platform is viable; at 100k or multi-instance, the medium and major improvements become necessary. Security and data model are above average; product and conversion flow are good; scalability and operational hardening need the suggested upgrades.

---

*End of report. All references are to existing files in the repository.*
