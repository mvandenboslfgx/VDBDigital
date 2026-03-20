# Deploy naar Vercel

## Stap 1 — Inloggen (eenmalig)

Open een terminal in de projectmap en voer uit:

```bash
npx vercel login
```

Volg de instructies (e‑mail of GitHub). Er opent een browser om in te loggen.

---

## Stap 2 — Deploy naar productie

Daarna:

```bash
npx vercel --prod
```

De eerste keer kiest Vercel je team/account en maakt een project aan. Bij "Link to existing project?" kun je **N** doen als je een nieuw project wilt, of **Y** als je een bestaand project wilt koppelen.

---

## Stap 3 — Environment variables

In het **Vercel Dashboard** → jouw project → **Settings** → **Environment Variables** zet je o.a.:

| Variable | Verplicht |
|----------|-----------|
| `DATABASE_URL` | ✅ |
| `DIRECT_URL` | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ |
| `STRIPE_SECRET_KEY` | ✅ |
| `STRIPE_WEBHOOK_SECRET` | ✅ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optioneel* |
| `OPENAI_API_KEY` | ✅ |
| `JWT_SECRET` | ✅ |
| `SITE_URL` | ✅ (bijv. `https://jouw-project.vercel.app`) |

`*` Deze app gebruikt server-side Stripe Checkout (`/api/stripe/create-checkout-session`), dus de publishable key is alleen nodig als je later client-side Stripe Elements toevoegt.

Volledige lijst: zie **docs/DEPLOY.md** sectie 6b.

Na het toevoegen of wijzigen van env vars: **Redeploy** (Deployments → ⋮ → Redeploy).

---

## Stap 4 — Klaar

Na een geslaagde deploy krijg je een URL zoals:

`https://vdb-digital-xxx.vercel.app`

Zet die (of je eigen domein) in **SITE_URL** en bij Stripe/Supabase als redirect-/webhook-URL.
