# VDB Digital — Upgrade Summary

Production-grade AI SaaS upgrade: architecture cleanup, Redis, audit queue, advanced audit engine, Stripe refactor, security, premium UI, and design system.

---

## 1) Summary of Improvements

### Phase 1 — Architecture
- **Modular layout** kept: `app/`, `components/`, `modules/`, `lib/`, `styles/`, `types/`, `prisma/`.
- **Stripe** plan resolution moved to a single helper: `lib/stripe/resolvePlanFromPriceId.ts` (used by webhook).
- **Audit domain** grouped under `modules/audit/` (queue, worker, process-audit).

### Phase 2 — Redis
- **`lib/redis.ts`**: Redis client (ioredis) when `REDIS_URL` is set; no-op when unset.
- **Cache**: `lib/cache.ts` uses Redis for `getOrSet` when available (JSON serialize/deserialize); otherwise in-memory.
- **Rate limiting**: Still in-memory (unchanged); Redis-backed rate limits can be added later via `setRateLimitStore()`.
- **`.env.example`**: `REDIS_URL` documented for cache and audit queue.

### Phase 3 — Audit Job Queue (BullMQ)
- **Queue**: `modules/audit/queue.ts` — `getAuditQueue()`, `addAuditJob(data)`, `isAuditQueueAvailable()`.
- **Worker**: `modules/audit/worker.ts` — processes jobs (run audit → capture lead → send email).
- **Processor**: `modules/audit/process-audit.ts` — `processAuditJob(job)`.
- **API**: `POST /api/ai/website-audit` accepts `body.useQueue === true`; when Redis is available it enqueues and returns `{ success: true, jobId, statusUrl }`.
- **Polling**: `GET /api/ai/website-audit/status?jobId=xxx` returns `{ status, reportId?, error? }`.
- **Script**: `npm run audit:worker` runs the worker (requires `REDIS_URL` and `DATABASE_URL`).

### Phase 4 — Advanced Audit Engine
- **Signals** in `lib/ai-website-audit.ts`: added `canonical`, `metaRobots`, `imageWithAltCount`, `formCount`, `ctaLikeCount`, `wordCount`.
- **Scores**: SEO (+ canonical, meta robots), UX (+ image alt ratio), Conversion (+ CTA-like links, forms).
- **AI prompt**: Extended with the new fields for richer insights.

### Phase 5 — Stripe
- **`lib/stripe/resolvePlanFromPriceId.ts`**: Single source for mapping Stripe price ID → `{ planId, planName, role }`.
- **Webhook** `app/api/stripe/webhook/route.ts`: Uses `resolvePlanFromPriceId`; idempotency and signature verification unchanged.
- **Checkout**: `SITE_URL` preferred for success/cancel URLs when set.

### Phase 6 — Security
- **Env**: `lib/env.ts` — `env` proxy for app (OPENAI, SMTP, JWT, ADMIN_EMAIL) and Zod `validateEnv()` / `safeValidateEnv()` for optional startup validation.
- **Existing**: Origin validation, rate limits, sanitization, and webhook verification unchanged.

### Phase 7 — Performance
- **Caching**: Dashboard and admin metrics use Redis when `REDIS_URL` is set (shared across instances).
- **Audit**: Optional background job removes long-running work from the request when queue is enabled.

### Phase 8 — Premium Landing
- **Hero**: Animated glow (Framer Motion), gradient background, clear CTAs.
- **Design**: Glass, motion, and typography already in place; hero enhanced.

### Phase 9–10 — Dashboard & Admin
- **Dashboard**: Metric cards, recent audits, billing link, upgrade prompts already present; no breaking changes.
- **Admin**: Users, plans, AI usage, leads, analytics, system, logs, chat, settings in place.

### Phase 11 — Design System
- **`components/ui/Badge.tsx`**: Variants default, gold, success, warning, muted.
- **`components/ui/Section.tsx`**: Optional heading/title/subtitle, glass wrapper, scroll-in motion.
- **`components/ui/index.ts`**: Exports `Badge`, `Section` (Button, Card, Input, Modal, Panel, MetricCard, etc. unchanged).

### Phase 12 — Polish
- **TypeScript**: Build passes with strict checks.
- **Imports**: No new circular dependencies; env used consistently where needed.

---

## 2) Architecture Overview

```
app/                    # Routes (App Router)
  api/                  # API routes (stripe, ai, auth, chat, admin, …)
components/             # UI (ui/, home/, dashboard/, admin/, chat/, …)
modules/                # Domain logic
  audit/                # Queue, worker, process-audit
  leads/                # auditLead, …
lib/                    # Shared services & config
  redis.ts              # Redis client (optional)
  cache.ts              # getOrSet (Redis or memory)
  rateLimit.ts          # In-memory rate limits (Redis adapter ready)
  env.ts                # env proxy + Zod validateEnv
  stripe/
    resolvePlanFromPriceId.ts
  ai-website-audit.ts   # Signals, scores, OpenAI summary
prisma/                 # Schema, migrations
scripts/
  run-audit-worker.ts   # Entry to run audit worker
```

**Data flow (audit)**  
- Sync (default): `POST /api/ai/website-audit` → `runFullWebsiteAudit` → `captureAuditLead` → response.  
- With queue: same POST with `useQueue: true` and `REDIS_URL` → `addAuditJob` → returns `jobId` → client polls `GET .../status?jobId=` → worker runs audit and stores result → client gets `reportId`.

---

## 3) Files Created / Modified

### Created
- `lib/redis.ts`
- `lib/stripe/resolvePlanFromPriceId.ts`
- `lib/env.ts` (Zod + env proxy; preserved existing `env` usage)
- `modules/audit/queue.ts`
- `modules/audit/process-audit.ts`
- `modules/audit/worker.ts`
- `app/api/ai/website-audit/status/route.ts`
- `scripts/run-audit-worker.ts`
- `components/ui/Badge.tsx`
- `components/ui/Section.tsx`
- `docs/UPGRADE_SUMMARY.md` (this file)

### Modified
- `package.json` — added `ioredis`, `bullmq`; script `audit:worker`.
- `lib/cache.ts` — Redis-backed getOrSet when `REDIS_URL` set.
- `lib/env.ts` — env proxy (OPENAI, SMTP, JWT, ADMIN_EMAIL) + Zod schema and validateEnv/safeValidateEnv.
- `lib/ai-website-audit.ts` — Extended signals (canonical, metaRobots, imageWithAltCount, formCount, ctaLikeCount, wordCount); score logic and AI input updated.
- `app/api/stripe/webhook/route.ts` — Uses `resolvePlanFromPriceId`.
- `app/api/ai/website-audit/route.ts` — Optional enqueue when `useQueue` and Redis; returns `jobId` and `statusUrl`.
- `components/home/HeroSection.tsx` — Animated glow, layout tweaks.
- `components/ui/index.ts` — Export Badge, Section.
- `.env.example` — `REDIS_URL` and note for audit queue.

---

## 4) Manual Steps Required

1. **Redis (optional)**  
   - Set `REDIS_URL` (e.g. `redis://localhost:6379`) to enable:
     - Redis-backed cache for dashboard/admin metrics.
     - Audit job queue (enqueue with `useQueue: true`).
   - Without Redis, app runs as before (in-memory cache, sync audit).

2. **Audit worker (when using queue)**  
   - Run in a separate process: `npm run audit:worker`.  
   - Requires `REDIS_URL` and `DATABASE_URL`.  
   - Use a process manager (e.g. systemd, PM2) or a worker dyno in production.

3. **Stripe**  
   - No change: same env vars and webhook URL.  
   - Plan resolution is centralized in `resolvePlanFromPriceId`.

4. **Env validation (optional)**  
   - Call `validateEnv()` or `safeValidateEnv()` at startup (e.g. in instrumentation or a bootstrap module) to validate required env.

5. **Frontend: queue + polling**  
   - To use background audit: send `useQueue: true` in the body of `POST /api/ai/website-audit` and poll `GET /api/ai/website-audit/status?jobId=<id>` until `status === 'completed'`, then use `reportId` (e.g. redirect to report page).

---

Build: `npm run build`  
Worker: `npm run audit:worker` (with Redis)
