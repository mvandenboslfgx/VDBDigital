# Productie checklist — VDB Digital

Print of kopieer; vink af per omgeving (Production / Staging).

**Canonieke URL:** `https://___________________________`

> **Fase:** na sectie 1–10 ben je *deployment-ready*; sectie **11–15** maken je *scale / performance / operability-ready* (aanbevolen vóór zware traffic).

---

## 1. Vercel & build

| | |
|---|---|
| ☐ Repo gekoppeld, **Node 20** (of `>=20 <23`) | ☐ Laatste `main` deploy **groen** |
| ☐ `npm run build` lokaal of in CI **OK** | ☐ `npm run typecheck` **OK** |

---

## 2. Environment variables (Vercel → Production)

| | |
|---|---|
| ☐ `DATABASE_URL` (pooler, bv. `:6543`) | ☐ `DIRECT_URL` (voor `prisma migrate deploy`) |
| ☐ `SITE_URL` **of** `NEXT_PUBLIC_SITE_URL` (= canonieke HTTPS-URL) | ☐ `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| ☐ `JWT_SECRET` (≥16 tekens) | ☐ `OPENAI_API_KEY` |
| ☐ `STRIPE_SECRET_KEY` (live) | ☐ `STRIPE_WEBHOOK_SECRET` |
| ☐ Alle `STRIPE_PRICE_ID_*` die de app gebruikt | ☐ `REDIS_URL` (Upstash TLS) |
| ☐ `CRON_SECRET` (lang, random) — **nodig voor `/api/cron/*`** | ☐ `TENANT_ROOT_DOMAIN` (bv. `vdb.digital`) |
| ☐ `META_ACCESS_TOKEN` + `META_AD_ACCOUNT_ID` (optioneel) | ☐ `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ZONE_ID` (optioneel) |
| ☐ `PLATFORM_CNAME_TARGET` (optioneel, custom domains) | ☐ SMTP / e-mail vars (optioneel) |

---

## 3. Database

| | |
|---|---|
| ☐ `npx prisma migrate deploy` gedraaid tegen productie-DB | ☐ `npx prisma generate` in build (postinstall) OK |
| ☐ Geen `migrate dev` op productie | ☐ Backup / restore-proces bekend (Supabase/host) |

---

## 4. Stripe

| | |
|---|---|
| ☐ Webhook endpoint: `https://<jouw-domein>/api/stripe/webhook` | ☐ Juiste events geselecteerd + signing secret in env |
| ☐ Testbetaling / test subscription op **live** (klein bedrag) | ☐ Customer portal + checkout redirect naar juiste locale/URL |

---

## 5. Domeinen & tenant

| | |
|---|---|
| ☐ Apex + `www` in Vercel DNS | ☐ **Wildcard** `*.vdb.digital` (of jouw `TENANT_ROOT_DOMAIN`) |
| ☐ HTTPS force / geen mixed content | ☐ Test: `https://<sub>.<root>/` laadt tenant-site (rewrite via `proxy.ts`) |

---

## 6. Cron (Vercel)

| | |
|---|---|
| ☐ Plan ondersteunt **Cron Jobs** | ☐ `CRON_SECRET` in Vercel = zelfde als verwacht door routes |
| ☐ Handtest: `GET /api/cron/autopilot` met `Authorization: Bearer <CRON_SECRET>` → **200** | ☐ Idem kort testen voor `/api/cron/revenue`, `/growth`, `/hooks` |

---

## 7. Redis & workers

| | |
|---|---|
| ☐ `REDIS_URL` bereikbaar vanaf Vercel | ☐ Rate limit / cache gedrag gecontroleerd |
| ☐ **BullMQ workers** (audits/commerce/fixes): apart proces gepland of bewust uit | ☐ Monitoring als queue vol of jobs falen |

---

## 8. Security

| | |
|---|---|
| ☐ Geen secrets in git / logs | ☐ Admin-routes alleen voor juiste rollen (smoke test) |
| ☐ Rate limiting actief op publieke / brute-force gevoelige API’s | ☐ CORS / origin checks waar van toepassing |

---

## 9. Rooktests na go-live

| | |
|---|---|
| ☐ Homepage + login | ☐ Dashboard laadt (LCP acceptabel; zie §11/§15) |
| ☐ Stripe: upgrade / add-on flow (test) | ☐ AI-endpoint (korte call) |
| ☐ Publieke tenant-pagina op subdomein of pad | ☐ `GET /api/health` (als aanwezig) |

---

## 10. Documentatie

| | |
|---|---|
| ☐ `docs/VERCEL_PRODUCTION.md` gelezen | ☐ Intern: wie runt migrations & wie heeft Stripe/CLOUD access |

---

## 11. Performance (kritisch voor schaal)

| | |
|---|---|
| ☐ **LCP / TTFB** gecontroleerd (Vercel Speed Insights of Lighthouse op `/`, `/dashboard`) | ☐ Zware client-fetches vermeden: kritieke data **server-first** waar mogelijk |
| ☐ Charts / zware widgets **lazy** (`dynamic`, `ssr: false` waar logisch) | ☐ Data fetching **parallel** (`Promise.all`) — geen onnodige sequential `await` |
| ☐ Redis-caching actief voor dure aggregaties (dashboard/control center keys) | ☐ API responses geen onnodige grote JSON (> ~100kb) op hot paths |
| ☐ Prisma: **`select`** i.p.v. volledige objecten op lijsten | ☐ **Indexes** op veelgebruikte filters (`siteId`, `userId`, `createdAt`, FK’s) — verify in Supabase/Postgres |
| ☐ Slow-query log of `pg_stat_statements` bekeken (staging/prod) | ☐ Geen bekende **N+1** in top routes (profiler / logs) |

---

## 12. API health & SLO’s (meet in staging/prod)

| | |
|---|---|
| ☐ Kritieke routes: **p95 latency** binnen team-budget (bv. dashboard APIs < ~1s p95) | ☐ Geen overbodige sequential DB-roundtrips in hot handlers |
| ☐ OpenAI: **timeout + fallback** (of duidelijke fout naar user) — geen hangende requests | ☐ Stripe webhook: **snel 2xx** na verwerking (async zware work) |
| ☐ Publieke endpoints: rate limits **aan** | ☐ Errors **gestructureerd** gelogd (`logger` / request id), geen stack traces naar client |

---

## 13. Resilience / failover

| | |
|---|---|
| ☐ Redis down: app **degradeert** (in-memory fallback / skip cache) — geen hard crash loop | ☐ OpenAI unavailable: UI/API **graceful** (retry/copy fallback waar gebouwd) |
| ☐ Stripe webhook: **idempotent** handlers + dead-letter / retry begrip (Dashboard logs) | ☐ Cron faalt: **zichtbaar** in Vercel logs + alert (e-mail/Slack) afgesproken |
| ☐ DB connection pool: geen **connection storm** bij traffic piek (pooler URL correct) | ☐ Timeouts op outbound HTTP (Meta, Cloudflare, …) waar aanwezig |

---

## 14. Observability (productie: sterk aanbevolen)

| | |
|---|---|
| ☐ **Sentry** (of gelijkwaardig): DSN in prod + errors + release tracking | ☐ Vercel **Logs** na deploy gecheckt (geen error storm) |
| ☐ (Optioneel) **Performance monitoring**: traces sample rate ingesteld | ☐ Geen `console.error` spam in prod zonder context |
| ☐ Belangrijke business events (signup, purchase) traceerbaar (analytics/logging) | ☐ On-call: wie kijkt logs bij incident? |

---

## 15. Dashboard & control center (UX + perceived speed)

| | |
|---|---|
| ☐ Dashboard **eerste zichtbare content** zonder wachten op secundaire blokken | ☐ Geen **dubbele** data-fetch (zelfde stats server + client) — server props waar mogelijk |
| ☐ Analytics / zware secties **lazy** of apart route-segment | ☐ **Skeletons** tijdens load i.p.v. lege spinners |
| ☐ Control center live polling: **geen** onnodige re-renders (diff op timestamp/data) | ☐ Redis cache TTL’s afgestemd op acceptabele staleness |
| ☐ Owner control center: **SSR `initialData`** + gedeelde `getControlCenterLiveData()` (geen dubbele eerste fetch) | ☐ `/dashboard/analytics`: server bundle + charts lazy (client wrapper) |
| ☐ **Event-driven cache:** `onPlatformActivity` na audit + Stripe (zie `docs/CACHE_POLICY.md`) | ☐ Control center: **adaptieve polling** (10s zichtbaar / 60s tab op achtergrond) |

---

**Datum afgerond:** _______________  
**Door:** _______________
