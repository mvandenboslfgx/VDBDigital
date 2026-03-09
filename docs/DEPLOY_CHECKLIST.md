# VDB Digital — Pre-launch & deploy checklist

## 1️⃣ Code op GitHub

Controleer lokaal:
```bash
git status
```
- Geen untracked `app/`, `components/`, `lib/`, `modules/`, `prisma/` → codebase is volledig gecommit.
- Anders: `git add .` → `git commit -m "Add full project codebase"` → `git push origin main`.

---

## 2️⃣ Database-migratie

Draai tegen de **productie-DB**:

```bash
npx prisma migrate deploy
npx prisma generate
```

Zorg dat `DATABASE_URL` en `DIRECT_URL` in je omgeving naar die DB wijzen. Controleer daarna dat o.a. deze tabellen bestaan: **User**, **Article**, **AuditCache**, **PublicAudit**, **AuditHistory**.

---

## 3️⃣ Environment variables (Vercel)

Vercel → Project → Settings → Environment Variables. Minimaal:

| Variable | Vereist |
|---------|--------|
| `DATABASE_URL` | ✅ |
| `DIRECT_URL` | ✅ (voor migrate) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | optioneel (admin/service) |
| `STRIPE_SECRET_KEY` | ✅ |
| `STRIPE_WEBHOOK_SECRET` | ✅ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ |
| `STRIPE_PRICE_ID_STARTER` / `_GROWTH` / `_AGENCY` | ✅ |
| `OPENAI_API_KEY` | ✅ |
| `JWT_SECRET` | ✅ |
| `SITE_URL` | ✅ (bv. `https://www.vdbdigital.nl`) |

Ontbreekt er één, dan kunnen build of API falen. Let vooral op **STRIPE_WEBHOOK_SECRET** en **DIRECT_URL** — die veroorzaken het vaakst fouten.

---

## 4️⃣ Vercel build

Vercel → Deployments → laatste deployment:

- Build status = **Ready**
- Geen errors in Build Logs / Functions / Runtime Logs

---

## 5️⃣ Live site testen

**Marketing:** `/`, `/website-scan`, `/tools/seo-check`, `/audit/example.com`  
**Audit:** scan uitvoeren → score, issues, recommendations tonen  
**SaaS:** `/dashboard`, `/dashboard/audits`, `/dashboard/billing`  
**Stripe:** upgrade, checkout, webhook, dashboard-update na betaling  
**Admin:** `/admin`, `/admin/users`, `/admin/betalingen`, `/admin/finance`

---

## 6️⃣ Sitemap

Open: `https://www.vdbdigital.nl/sitemap.xml`

Bevestig o.a.: `/`, `/website-scan`, `tools/*`, `audit/*`, kennisbank.

---

## 7️⃣ Security (gecontroleerd)

- **Webhook:** `stripe.webhooks.constructEvent()` + idempotency
- **Admin:** `canAccessAdmin(user)` in admin layout
- **Rate limit:** op `POST /api/ai/website-audit` (per minuut + 10/uur per IP)
- **Public audits:** geen email, userId of andere PII

---

## 8️⃣ Health check

**GET /api/health** bestaat en retourneert o.a.:

- `status`: `"ok"` | `"degraded"`
- `database`, `stripe`, `ai`: configuratiestatus
- 200 bij ok, 503 bij degraded

Gebruik voor monitoring of load balancers.

**Uptime monitoring (aanbevolen):** Monitor `GET /api/health` via [UptimeRobot](https://uptimerobot.com), [BetterStack](https://betterstack.com) of [Pingdom](https://pingdom.com). Interval: 1–5 minuten.

---

## 9️⃣ Google indexatie

Na launch:

1. Open [Google Search Console](https://search.google.com/search-console).
2. Voeg je domein toe (bijv. `https://www.vdbdigital.nl`).
3. Submit sitemap: `https://www.vdbdigital.nl/sitemap.xml`.

---

## Pre-deploy (samenvatting)

1. Env vars in Vercel (zie boven).
2. Eénmalig: `npx prisma migrate deploy` tegen productie-DB, daarna `npx prisma generate`.
3. Build command: `npm run build` (default).

---

## Bij build-fouten

- **Prisma "table does not exist"** → migraties draaien tegen de DB die bij build wordt gebruikt.
- **EPERM op prisma generate** → dev server/overige processen sluiten, daarna opnieuw `npx prisma generate`.
