# ChatGPT: production handoff — export, prompts, workflow

**Alles in één bestand:** zie ook **`docs/VDB_DIGITAL_COMPLETE_AUDIT_AND_HANDOFF.md`** (bundel van handoff + prompts + security context + CI + roadmap + triple-check).

Dit is je **AI handoff-protocol**: je gebruikt een LLM als **tweede senior engineer** op je echte codebase — niet als vervanging van jouw eindverantwoordelijkheid (build, Stripe-dashboard, infra, handmatige tests blijven van jou).

Geen tool kan “100% foutloos” of omzet **garanderen**; wel krijg je zo **diepe audits**, P0/P1-prioriteit en concrete patches.

---

## 1. Wat je in één keer meegeeft (volgorde)

| # | Bestand | Waarom |
|---|---------|--------|
| 1 | **`docs/CHATGPT_COMPLETION_HANDOFF.md`** (dit bestand) | Instructies + prompts |
| 1b | **`docs/CURSOR_MASTER_AUDIT_PROMPT.md`** (optioneel) | Brede audit: security + perf + UX + design |
| 2 | **`docs/PLATFORM_SECURITY_CONTEXT.md`** | Scope, auth, Stripe, mappen — voor **context-aware** audits |
| 3 | **`docs/PROJECT_FOR_CHATGPT_TRIPLE_CHECK.md`** | Architectuur, flows, checklist |
| 4 | **`docs/PLATFORM_BLUEPRINT.md`** (optioneel maar sterk voor dit platform) | Blueprint / domeinterminologie |
| 5 | **`.env.example`** (geen echte `.env`!) | Welke secrets nodig zijn |
| 6 | **`PROJECT_EXPORT_FOR_REVIEW.txt`** | Volledige code-export |
| 7 | Optioneel: **`DEPLOY_VERCEL.md`**, **`MIGRATION.md`**, **`docs/PRODUCTION_IMPROVEMENTS_REPORT.md`** | Deploy, migraties, eerdere bevindingen |

**Belangrijk:** commit of deel **nooit** `.env`, API-keys, Stripe-webhook secrets of database-wachtwoorden.

---

## 2. Export genereren (lokaal)

```bash
node scripts/export-for-chatgpt-review.js
```

Dit maakt **`PROJECT_EXPORT_FOR_REVIEW.txt`** in de projectroot (staat in `.gitignore`). Grootte ~1,5+ MB; gebruik **upload** in de LLM als dat kan; anders in logische stukken (`app/api/`, `modules/`, `lib/`, …).

---

## 3. Verificatie na wijzigingen

- `npm run validate-env` — env-namen vóór build
- `npm run build` — TypeScript + Next build
- `npm run lint` — ESLint
- `npx prisma migrate deploy` — productie na schema-wijzigingen

Workers (Redis/queues): `npm run audit:worker`, `npm run fix:worker`, `npm run ads:metrics:worker` — alleen als je die paden actief gebruikt.

---

## 4. Prompts — kies **één** per sessie

Plak de gekozen prompt **onder** je uploads. Vul `[JE_DOMEIN]` in waar nodig.

### 4.1 Standaard (Nederlands) — snelle productiecheck

Voor: brede check, checklist §5 in `PROJECT_FOR_CHATGPT_TRIPLE_CHECK.md`, maximaal 8 “done”-items vandaag.

```
Je bent een senior full-stack engineer (Next.js App Router, Prisma, Supabase, Stripe, Vercel).

Context:
- Ik heb het bestand PROJECT_EXPORT_FOR_REVIEW.txt (volledige codebase) en PROJECT_FOR_CHATGPT_TRIPLE_CHECK.md bijgevoegd.
- Domein / productie-URL: [JE_DOMEIN]
- Doel: productieklare site — geen theoretische refactor; alleen concrete bugs, security-gaten, ontbrekende edge cases en blokkerende build/deploy-problemen.

Taken (in deze volgorde):
1) Geef een korte executive summary: top 10 risico’s (security, data, betalingen, auth) met ernst (P0–P3).
2) Controleer de checklist in PROJECT_FOR_CHATGPT_TRIPLE_CHECK.md §5 tegen de echte code in de export; markeer wat WEL klopt en wat NIET of twijfelachtig is.
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

### 4.2 Advanced (English) — principal audit voor dit SaaS-platform

Voor: **deep production audit** — security, schaal, queues/workers, Stripe, Redis/BullMQ-failure modes, architectuur-koppeling, observability. Gebruik dit als je audit/fix-engine, ads, workers en learning-laag in scope wil.

Stack in deze repo o.a.: **Next.js (App Router)**, **Prisma**, **Supabase**, **Stripe**, **Redis**, **BullMQ** (zie `package.json` voor exacte versies).

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

### 4.3 Master audit (Cursor) — security + performance + UX + design

Voor een **brede** end-to-end review (alles tegelijk — kan veel ruis geven). Prompt en uitleg staan in **`docs/CURSOR_MASTER_AUDIT_PROMPT.md`**.

Tip: laat het model **expliciet P0/P1 eerst** uit die brede scope halen, of splits per map (`app/api/`, `components/`, …).

---

## 5. Herhaalbare workflow (elke grote wijziging)

1. `node scripts/export-for-chatgpt-review.js`
2. Zelfde upload-set als §1 (minimaal: triple-check doc + export; blueprint als je architectuur wil laten matchen)
3. Advanced prompt (§4.2) of standaard (§4.1) — advanced na grote wijzigingen in `modules/` of workers
4. **Eerst P0 + P1** fixen, dan pas P2
5. `npm run build` + handmatige smoke tests → deploy

Zo wordt dit je vaste **senior review-laag** bovenop git/CI.

**Verder automatiseren (export-artifacts, deploy-triggers, optionele audit-history in DB):** zie **`docs/AUTO_AUDIT_ROADMAP.md`**.

**CI / fail gates (lint, typecheck, dependency audit, gitleaks):** zie **`docs/CI_SECURITY_GATES.md`**.

---

## 6. Realistische verwachting

- Eén LLM-ronde vervangt geen staging-tests, Stripe-testmodus, of load tests.
- **Omzet** hangt niet alleen van code af — wel van betrouwbaarheid, vertrouwen en operatie; hardening helpt bij het eerste.

---

## 7. Snelle index (waar dingen vaak zitten)

| Onderwerp | Waar kijken |
|-----------|-------------|
| API routes | `app/api/` |
| Auth / user | `lib/auth.ts`, `lib/supabase/` |
| Stripe | `app/api/stripe/`, `lib/stripe.ts` |
| Database | `prisma/schema.prisma`, `prisma/migrations/` |
| Edge / routing | `proxy.ts` (Next.js 16: request id + auth/admin guards + cache hints) |
| Achtergrondjobs | `modules/*/worker.ts`, `scripts/run-*-worker.ts` |

---

*Export bevat o.a. `proxy.ts`, `eslint.config.mjs`, `prisma.config.ts` naast `app/`, `components/`, `lib/`, `modules/`, `prisma/`.*
