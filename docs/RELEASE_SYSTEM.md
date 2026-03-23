# Release system (Vercel + GitHub)

Doel: **gecontroleerde releases**, snelle **rollback**, en **observability** — zonder bestaande `/api/health` (DB/Stripe/AI) te vervangen.

## Strategie

| Omgeving | Rol |
|----------|-----|
| **Vercel Preview** | Elke PR — testen, Upgrade Validation workflow |
| **Vercel Production** | `main` — gecontroleerde release |

Typische flow:

1. PR → Preview deploy (Vercel) + CI / Upgrade Validation  
2. Merge naar `main` → Vercel Production deploy (Git-integratie) **of** CLI-deploy uit workflow  
3. **`release.yml`** bouwt opnieuw, smoke-test, optioneel `vercel deploy --prod`, daarna **post-deploy health** op `PRODUCTION_URL`

## Workflow: `.github/workflows/release.yml`

Triggert op **push naar `main`** en **workflow_dispatch**.

Stappen:

1. `npm ci` + `npm ls --depth=0`  
2. `npx prisma generate`  
3. `npm run build` (zelfde placeholder-env als CI)  
4. **Smoke:** `next start` → `GET /api/health/live` (JSON `status === "ok"`)  
5. **Optioneel — Vercel CLI deploy:** alleen als repo variable **`RELEASE_USE_VERCEL_CLI`** = `true`  
   - Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`  
6. **Post-deploy:** `curl` naar `{PRODUCTION_URL}/api/health/live` met retries (Vercel kan nog builden)

### Variabelen / secrets (GitHub)

| Name | Type | Beschrijving |
|------|------|--------------|
| `PRODUCTION_URL` | Variable | Bijv. `https://www.jouwdomein.nl` (geen trailing slash) — voor post-deploy check |
| `RELEASE_USE_VERCEL_CLI` | Variable | `true` = workflow doet `vercel deploy --prod`; `false` = alleen Git-integratie op Vercel |
| `RELEASE_REQUIRE_PRODUCTION_HEALTH` | Variable | `true` = **verplicht** `PRODUCTION_URL`; faalt als leeg (strikte productie-gate) |
| `VERCEL_TOKEN` | Secret | Vercel token |
| `VERCEL_ORG_ID` | Secret | Team ID |
| `VERCEL_PROJECT_ID` | Secret | Project ID |

**Aanbevolen:** `RELEASE_USE_VERCEL_CLI=false` als Vercel al bij elke push naar `main` deployt — dan dubbele deploys vermijden. Zet `PRODUCTION_URL` zodat de post-deploy stap wacht tot de nieuwe build live is.

## Alles invullen (copy checklist)

Gebruik deze checklist om **alles** in te vullen zonder iets te missen.

### Vercel Environment Variables (Production + Preview waar relevant)

| Key | Verplicht | Opmerking |
|-----|-----------|-----------|
| `DATABASE_URL` | Ja | Runtime DB URL |
| `DIRECT_URL` | Ja | Prisma direct URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Ja | Client Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Ja | Client Supabase anon key |
| `STRIPE_SECRET_KEY` | Ja | Server-only Stripe key |
| `STRIPE_WEBHOOK_SECRET` | Ja | Stripe webhook secret |
| `OPENAI_API_KEY` | Ja | AI endpoints |
| `JWT_SECRET` | Ja | Min 16 chars |
| `SITE_URL` | Ja | Publieke URL |
| `REDIS_URL` | Ja | Cache / limits / self-healing state |
| `CRON_SECRET` | Ja (self-healing) | Auth voor Vercel cron endpoint |
| `VERCEL_TOKEN` | Ja (self-healing rollback) | Vercel API rollback |
| `RELEASE_MODE` | Aanbevolen | `production` of `canary` |
| `RELEASE_ROLLOUT_PERCENT` | Aanbevolen | 0–100 |
| `HEALTHCHECK_SECRET` | Aanbevolen | Beveiligt deep health route |
| `SLACK_WEBHOOK_URL` | Optioneel | Incident alerts |
| `SELF_HEALING_SENTRY_ALERT_SECRET` | Optioneel | Webhook secret voor `/api/release/sentry-alert` |
| `SELF_HEALING_ERROR_RATE_THRESHOLD_PERCENT` | Optioneel | Default 5 |

### GitHub Actions Variables

| Key | Verplicht | Opmerking |
|-----|-----------|-----------|
| `PRODUCTION_URL` | Ja | Bijvoorbeeld `https://www.vdbdigital.nl` |
| `RELEASE_USE_VERCEL_CLI` | Ja | `true` of `false` |
| `RELEASE_REQUIRE_PRODUCTION_HEALTH` | Ja | `true` aanbevolen voor harde gate |

### GitHub Actions Secrets

| Key | Verplicht | Opmerking |
|-----|-----------|-----------|
| `VERCEL_TOKEN` | Alleen bij CLI deploy | Nodig voor `vercel deploy --prod` in workflow |
| `VERCEL_ORG_ID` | Alleen bij CLI deploy | Team ID |
| `VERCEL_PROJECT_ID` | Alleen bij CLI deploy | Project ID |

## Health endpoints

| Route | Doel |
|-------|------|
| **`GET /api/health`** | Diepe check (DB, cache, optioneel secret header) — kan **503** bij DB-problemen |
| **`GET /api/health/live`** | **Liveness** — geen DB, `status: "ok"` + `version` (git SHA) — CI en uptime |

## Code

- `lib/release-mode.ts` — `isCanary()`, `RELEASE_MODE=canary` op Vercel  
- `lib/feature-flags.ts` — `FLAGS` + `isFeatureEnabled` + `isInRolloutPercent`  
- `lib/deployment.ts` — `getDeploymentInfo()` / meta voor responses  
- `app/api/health/live/route.ts` — lichte health voor release checks  

## Rollback (Vercel)

Vercel Dashboard → Production deployment → **Rollback**, of lokaal:

```bash
export VERCEL_TOKEN=...
npm run release:rollback
# of: bash scripts/rollback.sh
```

Zie [Vercel rollback](https://vercel.com/docs/deployments/instant-rollback) — vorige production deployment wordt opnieuw actief.

## Self-healing auto-rollback (enterprise recovery)

Deze repo bevat nu een self-healing laag die automatisch Vercel rollback triggert wanneer productie degraderend blijft.

### Cron

- Nieuw endpoint: `GET /api/cron/self-healing`
- Vercel cron loopt elke minuut (alleen op **production** deploys; zie `vercel.json`).
- Beveiliging: Vercel voegt `Authorization: Bearer <CRON_SECRET>` toe aan cron requests.

### Trigger voorwaarden

- De cron checkt elke minuut `GET /api/health`
- Bij aanhoudende failure (minimaal 2 opeenvolgende checks) wordt een rollback gestart.

### Vereiste env variabelen (Vercel)

- `CRON_SECRET` (min. 16 chars, gebruikt voor authenticatie van de cron endpoint)
- `VERCEL_TOKEN` (token met permissie om rollback te doen via Vercel API)
- Optioneel: `SLACK_WEBHOOK_URL` voor meldingen
- Optioneel: `SELF_HEALING_SENTRY_ALERT_SECRET` + webhook `POST /api/release/sentry-alert` voor Sentry error spikes

### Sentry webhook (optioneel)

Als je Sentry error spikes wilt laten rollen:

- Configureer een webhook die `POST /api/release/sentry-alert` aanroept.
- Body (voorbeeld):
  - `{"errorRatePercent": 7.5, "fatal": false, "errorSummary": "..."}`

De endpoint triggert rollback bij `fatal=true` of `errorRatePercent >= 5` (drempel kan via `SELF_HEALING_ERROR_RATE_THRESHOLD_PERCENT`).

## Feature flags & canary

- Zet op een Preview of canary deployment: `RELEASE_MODE=canary` (Vercel → Environment Variables).  
- Per flag: `FEATURE_FLAG_NEW_DASHBOARD=true` etc. (zie `lib/feature-flags.ts`).  
- **Percentage rollout (stabiel per user):** `isInRolloutPercent(percent, userId)`  
- **Globaal % (env):** `RELEASE_ROLLOUT_PERCENT=25` + `isInRolloutPercent(getGlobalRolloutPercent(), userId)`  
- **Random sample (alleen low-risk):** `isInRandomRolloutSample(percent)` — niet stabiel tussen requests.

## Deployment tracking

- `getDeploymentInfo()` / `getDeploymentDiagnostics()` in `lib/deployment.ts`  
- `recordDeploymentError()` — hook voor later Sentry/APM  

## GitHub Releases (optioneel)

Er wordt **geen** release per push automatisch aangemaakt (voorkomt spam). Handmatig: **Releases → Draft** of tag `v1.x.x` + release notes. Wil je automatisering, gebruik een aparte workflow op **tag push `v*`** of `workflow_dispatch` met een action zoals `softprops/action-gh-release`.

## Fail-safe

Release job is **succesvol** als:

- build + smoke slagen  
- post-deploy check slaagt **als** `PRODUCTION_URL` gezet is (anders wordt die stap **geskipt** met een duidelijke log — zet de URL voor strikte productie-gates)

## Dubbele builds

Push naar `main` kan **Vercel** én **GitHub Actions** laten builden. Dat is bewust: CI is je **gate**; Vercel is **hosting**. Minimize overlap door CLI-deploy alleen wanneer nodig.
