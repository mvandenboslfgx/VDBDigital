# VDB Digital — Deploy & post-deploy checklist

## Pre-deploy (Vercel)

1. **Environment variables**  
   In Vercel project → Settings → Environment Variables, set at least:
   - `DATABASE_URL` (Supabase pooler, port 6543)
   - `DIRECT_URL` (Supabase direct, port 5432 — required for `prisma migrate deploy`)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_PRICE_ID_STARTER`, `STRIPE_PRICE_ID_GROWTH`, `STRIPE_PRICE_ID_AGENCY`
   - `OPENAI_API_KEY`
   - `JWT_SECRET`
   - `SITE_URL` (e.g. `https://www.vdbdigital.nl`)
   - Optioneel: `ADMIN_EMAIL`, `OWNER_EMAILS`, SMTP, etc.

2. **Database migrations**  
   Run on your DB (e.g. once from local or Vercel build):
   ```bash
   npx prisma migrate deploy
   ```
   This creates `Article`, `AuditCache`, and `PublicAudit` if missing.

3. **Build command**  
   Default `npm run build` is fine. Next.js 16 + Turbopack.

---

## Post-deploy validation

After each deploy, verify:

| Check | URL / action |
|-------|----------------|
| Homepage loads | `https://www.vdbdigital.nl/` |
| Website scan | `/website-scan` → run audit → result page |
| Audit results | Score, issues, recommendations render |
| Stripe checkout | `/prijzen` → Start plan → redirect to Stripe |
| Dashboard | `/dashboard` (logged in) |
| Admin dashboard | `/admin/dashboard` (admin/owner only) |
| Sitemap | `https://www.vdbdigital.nl/sitemap.xml` |
| Public audit page | `/audit/[domain]` (after at least one scan) |

---

## Security (verified)

- Stripe webhook: signature verification + idempotency
- Admin routes: require admin/owner via `canAccessAdmin` in layout
- Audit endpoint: rate limit per minute + 10/hour per IP
- API input: Zod + origin validation on sensitive routes
- Analytics track: `validateOrigin` on `/api/analytics/track`
- Public audit: no PII stored (domain, score, summary only)

---

## If build fails

- **Prisma "table does not exist"**  
  Run `prisma migrate deploy` against the same DB used at build. Static generation may call Prisma; migrations must be applied first.

- **EPERM on Prisma generate**  
  Close dev server / other processes using `node_modules`, then run `npx prisma generate` again.
