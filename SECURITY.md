# VDB Digital — Security Hardening

Production-grade security measures for the SaaS platform.

---

## 1. Environment & Secrets

- **Never commit**: `.env`, `.env.local`, `.env.*` — all ignored via `.gitignore`.
- **Only template in repo**: `.env.example` (no real values).
- **Secrets in env only**: `DATABASE_URL`, `DIRECT_URL`, `STRIPE_SECRET_KEY`, `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `RESEND_API_KEY`, `STRIPE_WEBHOOK_SECRET`. No hardcoded secrets in source.
- Set `OWNER_EMAILS` in production; avoid relying on default owner list.

---

## 2. API Security

- **Rate limiting**: Auth (`/api/auth/*`), AI (`/api/ai/*`), contact (`/api/contact`), Stripe checkout/portal and webhook use `lib/rateLimit` (per-IP; sensitive endpoints capped).
- **Input validation**: Zod schemas and `lib/validation`; `lib/apiSecurity` for sanitization, origin/referer checks, prompt-injection detection.
- **Request size**: `lib/requestSafety` — body size checks (512 KB default, 1 MB Stripe webhook) to prevent DoS; used on contact, audit, Stripe webhook.
- **Error handling**: `handleApiError` in `lib/apiSafeResponse` — production responses never expose stack traces; errors logged and sent to Sentry when configured.
- **CSRF**: `validateCsrf` and origin validation on state-changing admin/API routes.

---

## 3. Authorization

- **Dashboard**: All `/dashboard/*` and `/portal/*` require logged-in user via `requireUser()` in layout/page.
- **Admin**: `/admin/*` and `/api/admin/*` require admin/owner via `canAccessAdmin()` (pages) and `requireAdminOrOwner()` (API). Sensitive mutations use `validateCsrf`.
- **Permissions**: `lib/permissions` and `lib/auth`; role checks before any sensitive operation.

---

## 4. Database Safety

- **ORM**: Prisma only — parameterized queries; no raw SQL with user input.
- **Select**: Prefer `select`/`include` with limited fields; avoid returning full entities where not needed.
- **No exposure**: Audit reports and user data returned only to authorized users; share slugs are unguessable.

---

## 5. Security Headers (Next.js)

Configured in `next.config.mjs`:

- `Content-Security-Policy` (strict; adjust `script-src` if needed for nonces).
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Permissions-Policy` (camera, microphone, geolocation disabled).
- `X-Powered-By` disabled.

---

## 6. Error Handling & Logging

- **Production**: Generic user-facing message; stack and internal details only in logs.
- **Logging**: `lib/logger`; no secrets in log payloads.
- **Sentry**: Optional; set `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` and install `@sentry/nextjs`; `lib/sentry` and `handleApiError` integrate when available.

---

## 7. Rate-Limited Routes

| Area        | Limit / Protection                          |
|------------|---------------------------------------------|
| `/api/auth/*` | Auth rate limit + login lockout after failures |
| `/api/ai/*`   | AI rate limit; audit also per-hour cap     |
| `/api/contact` | Sensitive rate limit                        |
| `/api/stripe/*` | Sensitive rate limit (checkout, portal, webhook) |

---

## 8. Monitoring & Health

- **Health**: `GET /api/health` — status, DB, Stripe/AI config flags; no secrets. Cached 45s.
- **Sentry**: Optional error monitoring; configure in `lib/sentry.ts` and env.

---

## 9. Dependencies

- Run `npm audit` regularly; fix high/critical issues.
- Prefer minimal dependencies; keep Next.js and Prisma up to date.

---

## 10. Checklist Before Go-Live

- [ ] All secrets in env; `.env` not in repo.
- [ ] `OWNER_EMAILS` and `SITE_URL` set for production.
- [ ] Rate limiting and body size limits enabled (default).
- [ ] Admin and dashboard routes require auth/role.
- [ ] CSP and security headers active.
- [ ] Error handling does not leak stack/internal data.
- [ ] Optional: Sentry and Redis for rate limit/cache at scale.
