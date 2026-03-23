# VDB Digital – Productie-checklist

Stappen om de SaaS-platform naar productie te brengen.

---

## 1) Database-migraties toepassen

In productie (of lokaal om te testen):

```bash
npx prisma migrate deploy
```

Of via npm-script:

```bash
npm run prisma:migrate:deploy
```

Controleer daarna of de tabellen bestaan:

- **User**
- **Plan**
- **AuditReport**
- **AIUsage**
- **ChatConversation**
- **ChatMessage**

---

## 2) Plans seeden

Zorg dat de plannen in de database staan:

```bash
npx prisma db seed
```

Of:

```bash
npm run prisma:seed
```

Controleer dat je vier plannen hebt:

| Plan     | Prijs    |
|----------|----------|
| Gratis   | €0       |
| Starter  | €29/maand |
| Growth   | €79/maand |
| Agency   | €199/maand |

---

## 3) Stripe-prijzen aanmaken

In **Stripe → Products** drie prijzen aanmaken:

| Plan    | Price         |
|---------|---------------|
| Starter | €29 / maand   |
| Growth  | €79 / maand   |
| Agency  | €199 / maand  |

Je krijgt IDs zoals `price_1ABC123...`.

In je environment (.env):

```env
STRIPE_PRICE_ID_STARTER=price_xxx
STRIPE_PRICE_ID_GROWTH=price_xxx
STRIPE_PRICE_ID_AGENCY=price_xxx
STRIPE_SECRET_KEY=<from Stripe Dashboard — secret key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<from Stripe Dashboard — publishable key>
STRIPE_WEBHOOK_SECRET=<from Stripe CLI or Dashboard — whsec_…>
```

---

## 4) Stripe-webhook instellen

**Endpoint in Stripe:**

```
https://jouwdomein.nl/api/stripe/webhook
```

**Events:**

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## 5) Optioneel: PageSpeed activeren

Als je de performance-score wilt laten berekenen via PageSpeed Insights:

1. Bij Google Cloud een PageSpeed API key aanmaken.
2. In `.env`:

```env
PAGESPEED_ENABLED=true
PAGESPEED_API_KEY=xxxx
```

Let op: elke scan wordt dan ongeveer 5–10 seconden trager.

---

## 6) Productie-build

Controleren of alles compileert:

```bash
npm run build
```

Daarna starten:

```bash
npm start
```

Of deployen naar bijvoorbeeld Vercel.

---

## 6b) Deploy op Vercel

1. **Project koppelen**: Vercel → Import Git repo → Framework: Next.js (auto).
2. **Environment variables** (Vercel → Project → Settings → Environment Variables) voor **Production** (en evt. Preview):
   - `DATABASE_URL` (PostgreSQL connection string, bijv. Supabase pooler)
   - `DIRECT_URL` (direct connection voor Prisma migrations)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - Optioneel: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (alleen nodig voor client-side Stripe Elements)
   - `STRIPE_PRICE_ID_STARTER`, `STRIPE_PRICE_ID_GROWTH`, `STRIPE_PRICE_ID_AGENCY`
   - `OPENAI_API_KEY`, `JWT_SECRET`, `SITE_URL` (bijv. `https://www.vdbdigital.nl`)
   - Optioneel: `RESEND_API_KEY`, `REDIS_URL`, `SENTRY_DSN`
3. **Build**: Vercel gebruikt `npm run build`; `postinstall` draait `prisma generate` (placeholders als DATABASE_URL ontbreekt tijdens build).
4. **Migraties**: Na eerste deploy, lokaal of via CI: `npx prisma migrate deploy` met productie-DATABASE_URL, of gebruik Vercel’s “Run Command” / externe CI.
5. **Node**: Project gebruikt `engines.node: "22.x"`; zet in Vercel Project Settings ook Node.js 22.x voor consistentie.

---

## 7) Snelle functionele test

Doorloop deze flow:

1. Account aanmaken  
2. Dashboard openen  
3. Website-scan starten  
4. Rapport genereren  
5. “Upgrade naar Pro” klikken  
6. Stripe Checkout uitvoeren  
7. Dashboard opnieuw laden → plan moet **Pro** zijn  

---

## 8) Controlepunten (belangrijk)

In productie controleren:

- [ ] Chat-widget werkt  
- [ ] AI-rapport verschijnt  
- [ ] Stripe-upgrade werkt  
- [ ] Scanlimieten worden toegepast  
- [ ] Admin-analytics laden  
- [ ] `/api/health` geeft status **OK**  
