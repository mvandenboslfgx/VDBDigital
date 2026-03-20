# VDB Digital — volledige audit- & handoff-bundel

**Eén document** met: export-instructies, alle prompts, security context, CI-gates, roadmap en triple-check projectoverzicht.

- **Code zit hier niet in** — genereer apart: `node scripts/export-for-chatgpt-review.js` → `PROJECT_EXPORT_FOR_REVIEW.txt`.
- **Geen echte secrets** in prompts of commits; alleen `.env.example` als referentie.

---

## Inhoudsopgave

1. [Handoff: uploadvolgorde, export, verificatie, workflow, index](#deel-1--handoff-production)
2. [Prompts: standaard NL, advanced EN, master breed](#deel-2--prompts)
3. [Master audit prompt (volledige tekst + P0/P1-regels)](#deel-3--master-audit-prompt-volledig)
4. [Platform security context](#deel-4--platform-security-context)
5. [CI / security gates](#deel-5--ci--security-gates)
6. [Roadmap: auto-audit triggers](#deel-6--roadmap-auto-audit)
7. [Triple-check projectoverzicht](#deel-7--triple-check-projectoverzicht)

---

# Deel 1 — Handoff (production)

## 1.1 AI-handoff protocol

Je gebruikt een LLM als **tweede senior engineer** op je echte codebase — niet als vervanging van jouw eindverantwoordelijkheid (build, Stripe-dashboard, infra, handmatige tests blijven van jou).

Geen tool kan “100% foutloos” of omzet **garanderen**; wel krijg je zo **diepe audits**, P0/P1-prioriteit en concrete patches.

### Wat je upload (volgorde)

| # | Bron | Waarom |
|---|------|--------|
| 1 | **Dit bundelbestand** (`docs/VDB_DIGITAL_COMPLETE_AUDIT_AND_HANDOFF.md`) | Alles-in-één instructies + prompts |
| 2 | **`PROJECT_EXPORT_FOR_REVIEW.txt`** | Volledige code-export (na export-script) |
| 3 | **`.env.example`** (geen `.env`!) | Welke variabelen bestaan |
| 4 | Optioneel **`docs/PLATFORM_BLUEPRINT.md`**, **`DEPLOY_VERCEL.md`**, **`MIGRATION.md`** | Extra domein-/deploy-context |

**Belangrijk:** commit of deel **nooit** `.env`, API-keys, Stripe-webhook secrets of database-wachtwoorden.

### Export genereren (lokaal)

```bash
node scripts/export-for-chatgpt-review.js
```

Dit maakt **`PROJECT_EXPORT_FOR_REVIEW.txt`** in de projectroot (staat in `.gitignore`). Grootte ~1,5+ MB; gebruik **upload** in de LLM als dat kan; anders in logische stukken (`app/api/`, `modules/`, `lib/`, …).

### Verificatie na wijzigingen

- `npm run validate-env` — env-namen vóór build (productie: zie `build:prod`)
- `npm run build` — TypeScript + Next build
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npx prisma migrate deploy` — productie na schema-wijzigingen

Workers (Redis/queues): `npm run audit:worker`, `npm run fix:worker`, `npm run ads:metrics:worker` — alleen als je die paden actief gebruikt.

### Herhaalbare workflow (elke grote wijziging)

1. `node scripts/export-for-chatgpt-review.js`
2. Upload: dit bundelbestand + export (+ optioneel blueprint)
3. Kies prompt uit [Deel 2](#deel-2--prompts) — advanced na grote wijzigingen in `modules/` of workers
4. **Eerst P0 + P1** fixen, dan pas P2
5. `npm run build` + handmatige smoke tests → deploy

**CI / gates:** zie [Deel 5](#deel-5--ci--security-gates). **Automatisering roadmap:** zie [Deel 6](#deel-6--roadmap-auto-audit).

### Realistische verwachting

Eén LLM-ronde vervangt geen staging-tests, Stripe-testmodus of load tests.

### Snelle index (waar dingen vaak zitten)

| Onderwerp | Waar kijken |
|-----------|-------------|
| API routes | `app/api/` |
| Auth / user | `lib/auth.ts`, `lib/supabase/` |
| Stripe | `app/api/stripe/`, `lib/stripe.ts` |
| Database | `prisma/schema.prisma`, `prisma/migrations/` |
| Edge / routing | `proxy.ts` (Next.js 16: request id + auth/admin guards + cache hints) |
| Achtergrondjobs | `modules/*/worker.ts`, `scripts/run-*-worker.ts` |

Export bevat o.a. `proxy.ts`, `eslint.config.mjs`, `prisma.config.ts` naast `app/`, `components/`, `lib/`, `modules/`, `prisma/`.

---

# Deel 2 — Prompts

Plak **één** prompt per sessie onder je uploads. Vul `[JE_DOMEIN]` in waar nodig.

## 2.1 Standaard (Nederlands) — snelle productiecheck

Voor: brede check, checklist [§7.5](#75-triple-check-checklist-voor-chatgpt), maximaal 8 “done”-items vandaag.

```
Je bent een senior full-stack engineer (Next.js App Router, Prisma, Supabase, Stripe, Vercel).

Context:
- Ik heb het bestand PROJECT_EXPORT_FOR_REVIEW.txt (volledige codebase) en het bundeldocument VDB_DIGITAL_COMPLETE_AUDIT_AND_HANDOFF.md bijgevoegd.
- Domein / productie-URL: [JE_DOMEIN]
- Doel: productieklare site — geen theoretische refactor; alleen concrete bugs, security-gaten, ontbrekende edge cases en blokkerende build/deploy-problemen.

Taken (in deze volgorde):
1) Geef een korte executive summary: top 10 risico’s (security, data, betalingen, auth) met ernst (P0–P3).
2) Controleer de checklist in §7.5 van het bundeldocument tegen de echte code in de export; markeer wat WEL klopt en wat NIET of twijfelachtig is.
3) Lijst concrete code-aanpassingen: bestand + functie/route + exacte wijziging (diff-stijl of pseudocode). Geen vage adviezen.
4) Als iets niet te verifiëren is zonder runtime (env, Stripe dashboard, Supabase): zet het onder "Vereist manual test" met stappen.
5) Geef een "Definition of Done" voor vandaag: max 8 items die ik kan afvinken (build groen, webhook getest, etc.).

Constraints:
- Geen secrets genereren of vragen om echte keys; werk alleen met placeholders.
- Houd rekening met Nederlandse/EU context (privacy, cookie-info) op hoog niveau; geen juridisch advies als feit.
- Wees eerlijk over wat je niet kunt garanderen zonder live omgeving.

Outputformaat:
- P0/P1/P2/P3 secties
- Daarna checklist-resultaat
- Daarna actionable patches
- Daarna manual tests
```

## 2.2 Advanced (English) — principal audit voor dit SaaS-platform

Voor: **deep production audit** — security, schaal, queues/workers, Stripe, Redis/BullMQ-failure modes, architectuur-koppeling, observability.

Stack in deze repo o.a.: **Next.js (App Router)**, **Prisma**, **Supabase**, **Stripe**, **Redis**, **BullMQ**.

```
You are a principal-level software architect reviewing a production SaaS platform.

Context:
- Full codebase is provided (PROJECT_EXPORT_FOR_REVIEW.txt).
- Stack includes: Next.js App Router, Prisma, Supabase, Stripe, Redis, BullMQ.
- Domain features include (verify against actual code): AI audit pipeline, fix engine (preview/approve), learning/confidence layer, ads system, worker-based jobs.

Goal:
This is NOT a beginner review. I want a production-grade audit: real risks, scale limits, and hidden failure modes — not generic best practices.

Tasks (strict order):

1) P0–P3 issues:
   - security vulnerabilities
   - data integrity risks
   - race conditions
   - queue/worker failure modes
   - billing/Stripe edge cases
   - auth/session risks

2) Architecture consistency:
   - Are audit, fix, learning, and ads subsystems decoupled where they should be?
   - Hidden coupling, single points of failure, scaling bottlenecks?

3) Production failure scenarios:
   - What breaks under load?
   - What breaks if Redis is down or flaky?
   - What breaks if OpenAI is slow or errors?
   - What breaks if jobs are delayed, duplicated, or retried?

4) Concrete patches:
   - file path
   - function/route name
   - exact fix (diff-style preferred)

5) Observability gaps:
   - logging, metrics, tracing, alerting blind spots

6) Definition of Done for production readiness: max 10 checkable items

Constraints:
- No generic advice; no full rewrites; adversarial mindset (abuse, bots, partial outages).
- Do not ask for or invent real secrets.
- Be explicit where runtime/dashboard verification is required (Stripe, Supabase, Vercel).

Output format:
- P0 / P1 / P2 / P3
- Architecture risks
- Concrete patches
- Failure scenarios
- Observability gaps
- Definition of Done
```

## 2.3 Master audit (Cursor) — breed

Voor een **brede** end-to-end review: gebruik [Deel 3](#deel-3--master-audit-prompt-volledig) hieronder.

Tip: laat het model **expliciet P0/P1 eerst** uit die brede scope halen, of splits per map (`app/api/`, `components/`, …).

---

# Deel 3 — Master audit prompt (volledig)

Gebruik dit voor een **brede** pass over security, performance, UX, design en productie — naast de smallere prompts in [Deel 2](#deel-2--prompts).

**Realiteit:** geen enkele LLM kan “100% veilig” of “alle bugs” **garanderen**. Gebruik output als **prioriteitenlijst + concrete patches**, en valideer met `npm run build`, tests, staging en handmatige flows.

**Hoe in te zetten:** export + dit bundelbestand. Werk in domeinen of vraag om **alleen P0/P1** in één run.

```
Je bent een elite senior software architect, security engineer en performance specialist tegelijk.

Voer een volledige deep audit uit op mijn volledige codebase en infrastructuur met als doel:

1. MAXIMALE SECURITY (zero trust, production-ready)
2. OPTIMALE PERFORMANCE
3. PERFECTE MOBILE + DESKTOP UX
4. CONSISTENTE DESIGN & KLEUREN
5. 100% PRODUCTIE-KLAAR SYSTEEM (interpretatie: geen bekende blockers; geen absolute garantie)

---

## PRIORITEIT (verplicht hanteren)

- **P0** — direct exploiteerbaar of datalek: auth bypass, secrets in client, broken access control op klantdata, onbeveiligde webhooks.
- **P1** — serieus risico: ontbrekende validatie op state-changing API’s, rate limits, fouten in betalingspad.
- **P2/P3** — optimalisatie, cosmetiek, refactor-wensen.

## WERKREGELS

- In **één run** alleen **P0 + P1** fixen tenzij ik expliciet anders vraag.
- **Geen** cosmetische / stijl-only wijzigingen zonder expliciete opdracht.
- **Minimale diffs** per fix; geen brede rewrites.
- Bestaande gedrag niet breken; onduidelijkheden benoemen i.p.v. gokken.

---

## VOER DEZE CONTROLES UIT:

### 1. SECURITY AUDIT (CRITISCH)

Controleer en rapporteer (en stel fixes voor):

- XSS, injection (inclusief waar Prisma/raw queries voorkomen), CSRF waar van toepassing
- Auth bypass, broken access control op API-routes
- Of API-routes auth + inputvalidatie hebben waar nodig (Zod e.d.)
- Supabase-auth server-side; geen secrets op de client
- Rate limiting, headers (CSP, HSTS, …) — afstemmen op bestaande `proxy.ts` / `next.config`
- Uploads, logging van misbruik

Geen echte secrets in de prompt of output; alleen placeholders.

### 2. BACKEND & ARCHITECTUUR

- App Router-patronen, Prisma-queries (N+1, indexes)
- Redis/BullMQ: fail-safe, retries (zoals in `modules/*/queue.ts`)
- Foutafhandeling en logging

### 3. RESPONSIVE / UX

- Mobile/tablet/desktop — signaleren van patronen, niet elke pagina handmatig “perfect” claimen zonder UI-review

### 4. DESIGN CONSISTENCY

- Design tokens / Tailwind-gebruik; inconsistenties signaleren

### 5. PERFORMANCE

- Images, lazy loading, bundle-grootte, server vs client components — concrete verbeteringen

### 6. BETALINGEN & DATA

- Stripe client vs server; webhook-validatie; gevoelige data

### 7. BUGS

- Runtime-risico’s, gebroken flows — met bestand + route

### 8. PRODUCTIE CHECKLIST

- Debug-only code, SEO-basics, monitoring (bijv. Sentry hooks)

---

## OUTPUT STRUCTUUR

1. Kritieke security / data-issues (P0)
2. Belangrijke issues (P1)
3. Optimalisaties (P2/P3)
4. Concrete code fixes per bestand (diff-stijl of duidelijke stappen)
5. Architectuur-aanbevelingen (klein, geen gratuitous rewrite)

## CONSTRAINTS

- Geen volledige rewrite van het project.
- Geen fictieve “enterprise features” die niet in de repo passen.
- Onderscheid tussen wat je uit code afleidt vs wat alleen in productie te testen is (Stripe dashboard, Vercel, Supabase).

Werk alsof het platform publiek blootstaat aan aanvallen — maar wees eerlijk over grenzen van statische analyse.
```

*Variant met minder UX/design-ruis: gebruik [§2.2](#22-advanced-english--principal-audit-voor-dit-saas-platform) (principal English).*

---

# Deel 4 — Platform security context

Dit beantwoordt **scope-vragen** voor auditors en LLM’s — bijgewerkt uit de repo.

## 4.1 Project scope

| Vraag | Antwoord |
|--------|----------|
| **Type** | Publieke marketing- + content-site + **ingelogde SaaS** (dashboard, website-projecten, AI-audit/fix-flow), **admin/owner**-paneel. Geen marketplace tussen derden. |
| **User accounts** | **Ja** — Supabase Auth (cookies/JWT server-side via `@supabase/ssr`). |
| **Stripe** | **Ja** — abonnementen, checkout, customer portal, **webhooks** (`app/api/stripe/webhook`). |
| **File uploads** | **Ja, beperkt** — o.a. admin product-upload (`app/api/admin/products/upload`). |
| **AI** | **Ja** — website-audit, structured fix-plan, fix-preview (OpenAI), Redis/BullMQ workers waar geconfigureerd. |

**Attack surface:** auth cookies, `app/api/*`, Stripe-webhook, admin APIs, dashboard project/fix APIs, optioneel Redis workers.

## 4.2 Kritieke mappen

```
app/api/           # Server endpoints — auth, validatie, rate limits
app/admin/         # UI — proxy + role checks
app/dashboard/     # User UI — ownership via Prisma
components/        # XSS/React — client secrets check
lib/               # auth, prisma, stripe, rateLimit, secureRoute, csrf
modules/           # audit, fixes, ads — workers + queues
prisma/            # schema + migrations
proxy.ts           # Edge: request id, supabase cookies, protected paths
next.config.mjs    # Security headers (CSP, HSTS, …)
```

Tip voor prompts: *“beperk je tot `app/api` en `lib`”* voor een security-slice.

## 4.3 Auth

| Vraag | Antwoord |
|--------|----------|
| **Supabase Auth** | **Ja** — `getCurrentUser()` in `lib/auth.ts` met `createClient()` + `getUser()`. |
| **RLS** | **Ja, defense-in-depth** — migratie `20260318000000_supabase_lockdown_public_schema`: RLS op `public`, rechten `anon`/`authenticated` ingetrokken. **Data-access in de app via Prisma** (server-role; zie migratiecommentaar). |
| **Server-side** | **Ja** — `getCurrentUser` / `secureRoute` / admin checks. |

## 4.4 Stripe

| Vraag | Antwoord |
|--------|----------|
| **Webhooks** | **Ja** — `app/api/stripe/webhook/route.ts`, signature, idempotency (`ProcessedStripeEvent`). |
| **Customer portal** | **Ja** — o.a. `app/api/stripe/customer-portal`. |
| **Verificatie** | Webhook: raw body + `stripe-signature`. Geen Stripe-secrets in `proxy.ts`. |

## 4.5 Backlog (open)

- `npm audit` high/moderate via transities — CI gebruikt `audit:deps` (critical); zie [Deel 5](#deel-5--ci--security-gates).
- ESLint SonarJS als warnings tot triage.
- Gitleaks eerste run kan falen bij oude secrets in git — keys roteren / history opschonen.

---

# Deel 5 — CI / security gates

Statische LLM-audits zijn **geen** vervanging van CI.

## Lokaal

| Commando | Wat het afvangt |
|----------|-----------------|
| `npm run lint` | ESLint + `eslint-plugin-security` + SonarJS (Sonar vaak als **warnings**) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | Next build |
| `npm run audit:deps` | `npm audit --audit-level=critical` |

**Waarom geen vaste `high` in CI:** vaak geblokkeerd door transitieve tooling (`vercel` CLI e.d.); high/moderate als backlog naast critical-gate.

## GitHub Actions

- **`ci.yml`** — `npm ci` → Prisma generate → **lint** → **build**
- **`security.yml`** (parallel) — **typecheck** → **audit:deps** → **gitleaks** (geen dubbele lint)

## Runtime headers

In **`next.config.mjs`** (CSP, HSTS, `X-Frame-Options`, …). **`proxy.ts`:** request-id + routing/guards.

---

# Deel 6 — Roadmap: auto-audit

Handmatige export + prompt kun je later **gedeeltelijk** automatiseren — zie fasen hieronder. Geen LLM “garandeert” productie.

| Fase | Wat | LLM? |
|------|-----|------|
| Nu | Handmatig export + prompt | Ja, jij triggert |
| 1 | CI artifact van `PROJECT_EXPORT_FOR_REVIEW.txt` | Nee |
| 2 | Padfilter `modules/**`, `lib/**` → notificatie/extra stap | Nee |
| 3 | Vercel deploy hook → alleen meta (SHA, CI-link), geen volledige code naar API | Meestal nee |
| 4 | Diff/korte context naar LLM API (budget + secrets-beleid) | Ja |
| 5 | Optioneel Prisma `CodeAuditRun`-achtig model voor geschiedenis | Optioneel |

---

# Deel 7 — Triple-check projectoverzicht

## 7.1 Projecttype & stack

- **Framework:** Next.js 16 (App Router), React, TypeScript
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** Supabase Auth (login, signup, OAuth, password reset)
- **Billing:** Stripe (abonnementen, webhooks, customer portal)
- **AI:** OpenAI (website-audit, insights)
- **Styling:** Tailwind CSS, Framer Motion
- **Deploy:** Vercel

## 7.2 Belangrijke mappen

```
app/                    # Next.js App Router: pages, layouts, API routes
  api/                  # API routes (auth, stripe, ai, admin, contact, …)
  admin/                # Admin-pagina’s (layout beveiligd, require admin/owner)
  dashboard/            # User-dashboard (layout beveiligd, require user)
  website-scan/         # Publieke scanpagina
  prijzen/              # Prijzen + “Wat blijft er over”
  voorwaarden/          # Algemene voorwaarden
  privacy/              # Privacybeleid
  cookies/              # Cookiebeleid
  disclaimer/           # Disclaimer
  seo/[slug]/           # Programmatische SEO-pagina’s
  tools/[slug]/         # Programmatische tool-pagina’s
  report/[slug]/        # Gedeelde rapporten (share slug)
  kennisbank/           # Kennisbank-artikelen
components/             # Herbruikbare UI (Navbar, SiteShell, forms, …)
lib/                    # Shared logic (auth, prisma, stripe, cache, rateLimit, …)
modules/                # Feature-modules (audit, leads, …)
prisma/                 # Schema, migrations, seed
locales/                # i18n (nl, en, de)
proxy.ts                # Edge: request id, auth paths, cache hints
```

## 7.3 Kernflows om te controleren

### Website-scan & rapporten
- **Publiek:** `app/website-scan/page.tsx` — URL → preview; volledig rapport: e-mail of ingelogde user.
- **API:** `app/api/ai/website-audit/route.ts` — preview vs full; limieten in `lib/audit-limits.ts`; leads `modules/leads/auditLead.ts`.
- **Rapporten:** Dashboard op `lead.email`; gedeeld `app/report/[slug]/page.tsx`.

### Auth
- Supabase: `lib/supabase/server.ts`, `lib/auth.ts`.
- Callbacks: `app/auth/callback/route.ts`.
- Login/register/reset: `app/login/`, `app/register/`, `app/reset-password/`.

### Stripe
- Webhook: `app/api/stripe/webhook/route.ts` — signatuur, idempotency, events (checkout, subscription updated/deleted, invoice).
- Plans: `lib/audit-limits.ts`, `lib/stripe/resolvePlanFromPriceId.ts`, `lib/plans.ts`.
- Checkout/portal: `app/api/stripe/create-checkout-session`, `customer-portal`.

### Voorwaarden, privacy, prijzen
- Consistente copy over opzegging / wat blijft: `app/prijzen`, `app/voorwaarden`, `app/privacy`, `app/help`.

### Admin
- `app/admin/layout.tsx`, `components/admin/OwnerSidebar.tsx`, control center, email-config.

### Security
- Rate limiting `lib/rateLimit.ts`, request size `lib/requestSafety.ts`, CSRF waar nodig, headers `proxy.ts` / `next.config`, Zod op API’s.

## 7.4 Belangrijke bestanden

| Pad | Doel |
|-----|------|
| `app/layout.tsx` | Root layout, metadata, StructuredData, … |
| `app/page.tsx` | Homepage |
| `app/error.tsx` / `global-error.tsx` | Error boundaries |
| `next.config.mjs` | Security headers, images, redirects |
| `proxy.ts` | Edge: request id, auth guards |
| `prisma/schema.prisma` | Modellen |
| `lib/auth.ts` | getCurrentUser, requireUser, … |
| `lib/audit-limits.ts` | Planlimieten |
| `lib/metadata.ts` | SEO helpers |
| `lib/seo-pages.ts` / `programmatic-seo` | SEO/tools routes |
| `app/sitemap.ts` / `app/robots.ts` | SEO |

## 7.5 Triple-check checklist (voor ChatGPT)

- [ ] **Scans & rapporten:** Preview zonder e-mail; full met e-mail; limiet per plan; rapporten gekoppeld; na opzegging rapporten nog zichtbaar.
- [ ] **Stripe:** Webhook-signatuur; idempotency; subscription.deleted → gratis plan; invoice events.
- [ ] **Auth:** Supabase server client; OAuth redirect; geen secrets op client.
- [ ] **Voorwaarden/privacy/prijzen:** Consistente opzeg-copy.
- [ ] **Admin:** Alleen admin/owner; gevoelige API’s met auth + rate limit + validatie.
- [ ] **Security:** Geen .env in repo; rate limits; body limits; Zod.
- [ ] **SEO:** Sitemap, robots, canonicals/OG.
- [ ] **Design:** Eén primaire kleur (indigo); geen losse gold/amber in kern-UI.

## 7.6 Code delen met een LLM

1. **Aanbevolen:** Dit bundelbestand + **`PROJECT_EXPORT_FOR_REVIEW.txt`** (via `node scripts/export-for-chatgpt-review.js`).
2. **Alleen tekst zonder code:** Alleen [Deel 7](#deel-7--triple-check-projectoverzicht) — minder precies.
3. **Per map:** Plak export in stukken (`app/`, `lib/`, …).

## 7.7 Environment-variabelen (niet in repo)

- `DATABASE_URL`, `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- `JWT_SECRET`
- `SITE_URL`
- Optioneel: SMTP/Resend, `REDIS_URL`

Validatie: `npm run validate-env` (productie-build: `build:prod`).

---

*Einde bundel. Losse bestanden (`CHATGPT_COMPLETION_HANDOFF.md`, `CURSOR_MASTER_AUDIT_PROMPT.md`, …) mogen blijven bestaan als verwijzing; dit document is de single source voor “alles in één upload”.*
