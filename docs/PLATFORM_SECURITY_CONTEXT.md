# Platform security context — voor auditors & LLM-prompts

Dit document beantwoordt de gebruikelijke **scope-vragen** zodat je geen mondelinge intake nodig hebt. Bijgewerkt uit de repo-architectuur.

---

## 1. Project scope

| Vraag | Antwoord |
|--------|----------|
| **Type** | Publieke marketing- + content-site + **ingelogde SaaS-functionaliteit** (dashboard, website-projecten, AI-audit/fix-flow), **admin/owner**-paneel. Geen marketplace tussen derden. |
| **User accounts** | **Ja** — Supabase Auth (cookies/JWT server-side via `@supabase/ssr`). |
| **Stripe** | **Ja** — abonnementen, checkout, customer portal, **webhooks** (`app/api/stripe/webhook`). |
| **File uploads** | **Ja, beperkt** — o.a. admin product-upload (`app/api/admin/products/upload`). Geen publieke “upload anything”. |
| **AI** | **Ja** — website-audit, structured fix-plan, fix-preview (OpenAI), achtergrondjobs met Redis/BullMQ waar geconfigureerd. |

**Attack surface (hoog niveau):** auth cookies, alle `app/api/*` routes, Stripe-webhook, admin APIs, dashboard project/fix APIs, optioneel Redis workers.

---

## 2. Kritieke mappen (gerichte audits)

```
app/api/           # Alle server endpoints — auth, validatie, rate limits
app/admin/         # UI — extra laag via proxy + role checks
app/dashboard/     # User UI — ownership via Prisma queries
components/        # XSS/React — weinig raw HTML; check client secrets
lib/               # auth, prisma, stripe, rateLimit, secureRoute, csrf
modules/           # audit, fixes, ads — workers + queues
prisma/            # schema + migrations — data model
proxy.ts           # Edge: request id, redirects, supabase cookie refresh, protected paths
next.config.mjs    # Security headers (CSP, HSTS, …)
```

Per-map prompts staan al in **`docs/CURSOR_MASTER_AUDIT_PROMPT.md`** (breed) en **`docs/CHATGPT_COMPLETION_HANDOFF.md` §4** (standaard / principal). Voeg toe: *“beperk je tot `app/api` en `lib`”* voor een security-slice.

---

## 3. Auth

| Vraag | Antwoord |
|--------|----------|
| **Supabase Auth** | **Ja** — login/register/callback; `getCurrentUser()` in `lib/auth.ts` gebruikt `createClient()` + `getUser()`. |
| **RLS op Postgres** | **Ja, defense-in-depth** — migratie `20260318000000_supabase_lockdown_public_schema`: RLS aan op `public`, rechten voor `anon`/`authenticated` ingetrokken. **Applicatie-data gaat via Prisma**; server-role gedrag blijft werken zoals bedoeld (zie commentaar in migratie). **Geen** “alles via Supabase client + RLS policies”-model voor app-queries. |
| **Server-side session** | **Ja** — geen vertrouwen op client-only identity; API’s gebruiken `getCurrentUser` / `secureRoute` / admin checks. |

---

## 4. Stripe

| Vraag | Antwoord |
|--------|----------|
| **Webhooks** | **Ja** — `POST` `app/api/stripe/webhook/route.ts`, handtekening, idempotency (`ProcessedStripeEvent`). |
| **Customer portal** | **Ja** — route onder `app/api/stripe/` (o.a. customer-portal). |
| **Verificatie** | **Webhook:** raw body + `stripe-signature` in webhook route. **Geen** Stripe-secrets in `proxy.ts`; alleen server routes + env. |

---

## 5. Bekende pijnpunten / backlog (niet geheim)

- **Dependency audit:** `npm audit` toont nog high/moderate via transities (o.a. `vercel` CLI); CI gebruikt **`audit:deps`** (`critical` only) — zie **`docs/CI_SECURITY_GATES.md`**.
- **ESLint:** security + SonarJS staan aan; Sonar als **warnings** tot triage — zie **`docs/CI_SECURITY_GATES.md`**.
- **Gitleaks** in CI: eerste run kan falen als er ooit secrets in git stonden — keys roteren / history opschonen.

---

## 6. Wat jij aan een externe auditor nog kunt geven (optioneel)

- **`.env.example`** (geen echte `.env`).
- **Stripe dashboard:** webhook URL + gebeurtenissen (test).
- **Supabase:** redirect URLs + (indien relevant) Auth providers.

---

*Gebruik dit bestand als vaste bijlage bij “custom threat model” of map-specifieke prompts — zonder opnieuw dezelfde vragen te beantwoorden.*
