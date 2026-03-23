# Production Setup Guide (Vercel + GitHub)

Volg deze stappen exact om het platform live te zetten.

---

## 1. GitHub Setup

### 1.1 Repository pushen

```bash
git add .
git commit -m "production ready"
git push origin main
```

### 1.2 Branch Protection

Ga naar: GitHub -> Settings -> Branches -> Add rule (main)

Zet aan:

- Require pull request before merging
- Require status checks:
  - CI
  - Upgrade Validation
  - Release (optioneel maar aanbevolen)

---

## 2. Vercel Setup

### 2.1 Project koppelen

Ga naar: [https://vercel.com/new](https://vercel.com/new)

- Selecteer je GitHub repo
- Framework: Next.js (auto)
- Deploy

### 2.2 Domein instellen

Vercel -> Project -> Settings -> Domains

Toevoegen:

- vdb.digital
- *.vdb.digital (wildcard)

---

## 3. Vercel Environment Variables

Ga naar: Vercel -> Project -> Settings -> Environment Variables

Zet deze voor:

- Production
- Preview

### Verplicht

| Key | Waarde |
|---|---|
| DATABASE_URL | ... |
| DIRECT_URL | ... |
| NEXT_PUBLIC_SUPABASE_URL | ... |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ... |
| STRIPE_SECRET_KEY | ... |
| STRIPE_WEBHOOK_SECRET | ... |
| OPENAI_API_KEY | ... |
| JWT_SECRET | minimaal 16 chars |
| SITE_URL | https://www.jouwdomein.nl |
| REDIS_URL | ... |
| CRON_SECRET | random string |
| VERCEL_TOKEN | ... |

### Release / Self-healing

| Key | Voorbeeld |
|---|---|
| RELEASE_MODE | production |
| RELEASE_ROLLOUT_PERCENT | 100 |
| HEALTHCHECK_SECRET | random |
| SELF_HEALING_ERROR_RATE_THRESHOLD_PERCENT | 5 |

### Optioneel

| Key | Beschrijving |
|---|---|
| SLACK_WEBHOOK_URL | alerts |
| SELF_HEALING_SENTRY_ALERT_SECRET | sentry webhook |

---

## 4. GitHub Actions Variables

GitHub -> Settings -> Secrets and variables -> Actions

### Variables

| Key | Waarde |
|---|---|
| PRODUCTION_URL | https://www.jouwdomein.nl |
| RELEASE_USE_VERCEL_CLI | false |
| RELEASE_REQUIRE_PRODUCTION_HEALTH | true |

### Secrets

| Key | Waarde |
|---|---|
| VERCEL_TOKEN | ... |
| VERCEL_ORG_ID | ... |
| VERCEL_PROJECT_ID | ... |

---

## 5. Database

Run lokaal:

```bash
npx prisma migrate deploy
npx prisma generate
```

---

## 6. Stripe

Stripe Dashboard -> Webhooks

Endpoint:

```text
https://www.jouwdomein.nl/api/stripe/webhook
```

---

## 7. Cron Jobs (Vercel)

Controleer minimaal:

- self-healing (`/api/cron/self-healing`) draait elke minuut

---

## 8. Health Check

Open:

```text
https://www.jouwdomein.nl/api/health/live
```

Expected:

```json
{ "status": "ok" }
```

---

## 9. Full Flow Test

Test alles:

- signup
- AI site generatie
- publish
- checkout (Stripe)
- dashboard
- control center

---

## 10. Rollback (indien nodig)

```bash
npm run release:rollback
```

Of via Vercel dashboard -> Rollback

---

## 11. Go Live Checklist

- [ ] CI groen
- [ ] Upgrade Validation groen
- [ ] Release workflow groen
- [ ] Health endpoint OK
- [ ] Stripe webhook werkt
- [ ] Cron jobs draaien

---

## Resultaat

Na deze stappen:

- Platform live
- Releases gecontroleerd
- Auto-rollback actief
- Self-healing actief

---

## Structuur van docs

- `docs/RELEASE_SYSTEM.md` -> systeem uitleg
- `docs/DEPENDENCY_POLICY.md` -> dependency rules
- `docs/SETUP_PRODUCTION.md` -> execution

