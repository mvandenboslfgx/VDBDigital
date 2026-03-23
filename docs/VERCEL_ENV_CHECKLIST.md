# Vercel — environment variables for successful builds

Preview and Production builds run with `NODE_ENV=production`. The app validates **required** variables at build time (see `lib/env.ts` and `scripts/validate-env.js`).

If a deployment fails during **Collecting page data** or env validation, open the deployment log in Vercel or run:

```bash
npx vercel inspect <deployment-id> --logs
```

## Required on Vercel (Production + Preview)

Set these in **Vercel → Project → Settings → Environment Variables** and apply to **Production** and **Preview** (and **Development** if you use `vercel dev`):

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Supabase pooler URL |
| `DIRECT_URL` | Optional; non-pooler URL for migrations |
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `STRIPE_SECRET_KEY` | Must start with `sk_` |
| `STRIPE_WEBHOOK_SECRET` | Must start with `whsec_` |
| `OPENAI_API_KEY` | Any non-empty placeholder is enough for build if unused in that route |
| `JWT_SECRET` | Min 16 characters |
| `SITE_URL` | Public site URL, e.g. `https://www.example.com` |
| `REDIS_URL` | e.g. `redis://...` — **often missing** and breaks `next build` |

Optional but common: `STRIPE_PRICE_*`, SMTP, `SENTRY_DSN`, etc.

## After changing env vars

Redeploy the failed commit (or push an empty commit) so the new variables are picked up.

## Build fails at `postinstall` / `prisma generate`

**Historisch probleem:** `prisma.config.ts` had `import "dotenv/config"` terwijl `dotenv` niet in de productie-installatie zat → bij `NODE_ENV=production` (geen devDeps) crashte `postinstall`.

**Huidige aanpak:**

- Geen npm-pakket **`dotenv`** nodig voor Prisma-config.
- Met **Prisma 6 + `prisma.config.ts`** laadt de CLI zelf **geen** `.env` meer (`skipping environment variable loading`).
- In `prisma.config.ts` staat een **minimale `.env`-reader** (alleen als het bestand bestaat): lokaal werkt `DATABASE_URL` uit `.env`; op Vercel is er meestal geen `.env` → geen effect; env komt uit Vercel.
- `scripts/prisma-generate.js` zet nog steeds **placeholders** als `DATABASE_URL` ontbreekt tijdens install.

**Niet aanbevolen:** `prisma generate || echo …` — dan faalt de build stil en krijg je cryptische runtime-fouten.

## Dependabot / lockfile PRs keep failing

- Open the Vercel build log and confirm whether the error is **install** (postinstall) vs **`next build`**.
- Avoid depending on **build cache**: a commit that only changes `.github/workflows` may still deploy green while **lockfile** changes force a clean install and expose missing production deps.
- Zie **[DEPENDENCY_POLICY.md](./DEPENDENCY_POLICY.md)** voor de hybride strategie (core exact, rest semver), `.npmrc`, Dependabot en `npm ci`.
