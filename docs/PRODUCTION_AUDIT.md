# VDB Digital — Production audit (DevOps/CTO)

Laatste audit: voorbereiding Vercel-productie.

---

## Phase 1 — Project structure

- **Folders**: `app/`, `components/`, `lib/`, `modules/`, `prisma/`, `public/`, `styles/`, `scripts/`, `types/` aanwezig en in gebruik.
- **Verwijderd**: Lege/tijdelijke map `Nieuwe map` verwijderd.
- Geen andere tijdelijke of overbodige bestanden gevonden.

---

## Phase 2 — Security

- **.gitignore**: Bevat `.env`, `.env.*`, `!.env.example`, `node_modules`, `.next`, `.vercel`. Geen gevoelige bestanden in repo.
- **Secrets**: Geen hardcoded secrets in code; alleen placeholders in `.env.example` en documentatie. Stripe/OpenAI/Supabase via `process.env`.

---

## Phase 3 — Environment variables

- **.env.example** bevat alle vereiste variabelen:
  - Database: `DATABASE_URL`, `DIRECT_URL`
  - Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - Overig: `OPENAI_API_KEY`, `RESEND_API_KEY`, `JWT_SECRET`, `SITE_URL`
- Code leest veilig via `process.env`; optionele validatie in `lib/env.ts`.

---

## Phase 4 — Database

- **Prisma**: `schema.prisma` geldig; `prisma generate` slaagt (o.a. via postinstall met placeholders).
- **Queries**: Alleen parameterized Prisma-queries; enige raw gebruik: `$queryRaw\`SELECT 1\`` in health check (geen user input).
- **Migraties**: In `prisma/migrations/`; voor productie: `npx prisma migrate deploy` met productie-DATABASE_URL.

---

## Phase 5 — Authentication

- **Supabase**: Login, signup, OAuth callback (`/auth/callback`), reset-password flows aanwezig.
- **Dashboard**: `app/dashboard/layout.tsx` gebruikt `requireUser()`; redirect naar `/login` indien niet ingelogd. Alle dashboard-pagina’s beschermd.
- **Admin**: `canAccessAdmin` / `requireAdminOrOwner` op admin-routes.

---

## Phase 6 — Performance

- **Next.js**: `optimizePackageImports: ["framer-motion"]` in next.config; compressie aan.
- **Images**: Next.js Image, AVIF/WebP, remotePatterns geconfigureerd.
- **Build**: Geslaagd; geen overmatige bundle-waarschuwingen.

---

## Phase 7 — Build

- `npm install`: OK (postinstall = prisma generate).
- `npm run build`: OK (TypeScript, Prisma, Next.js build geslaagd).
- Geen Prisma- of TypeScript-fouten.

---

## Phase 8 — Vercel

- **vercel.json**: `framework: nextjs`, `regions: ["ams1"]`.
- **next.config.mjs**: Security headers, redirects, image config; geen `output: 'export'` (standaard server deployment).
- **Build**: Standaard `next build`; compatibel met Vercel.
- **Env**: Zie `docs/DEPLOY.md` sectie 6b voor vereiste environment variables op Vercel.

---

## Checklist voor go-live

- [ ] Alle env vars in Vercel gezet (Production + optioneel Preview).
- [ ] Database-migraties uitgevoerd (`prisma migrate deploy`).
- [ ] Stripe-webhook URL ingesteld op productie-domain.
- [ ] Supabase redirect URLs bevatten productie-domain.
- [ ] `SITE_URL` op productie-URL gezet.
- [ ] Eerste functionele test (login, scan, checkout, health) uitgevoerd.
