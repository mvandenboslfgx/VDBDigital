# CI / security gates — wat er echt afgedwongen wordt

Statische audits (LLM-prompts) zijn **geen** vervanging van CI. Deze repo combineert beide.

## Lokaal (voor je pusht)

| Commando | Wat het afvangt |
|----------|-----------------|
| `npm run lint` | ESLint + `eslint-plugin-security` + SonarJS (Sonar-regels als **warnings**) |
| `npm run typecheck` | `tsc --noEmit` — typefouten blokkeren |
| `npm run build` | Next build + TypeScript |
| `npm run audit:deps` | `npm audit --audit-level=critical` — faalt alleen op **critical** (bewuste keuze) |

### Waarom geen harde `--audit-level=high` in CI?

In veel monorepo’s blokkeert `high` maandenlang door **transitieve** deps (bijv. `vercel` CLI), terwijl je app-runtime op `next` draait. Dan wordt “CI groen” een upgrade-traject, geen security-kwaliteit.

**Werkwijze:** `audit:deps` draaien + GitHub Dependabot / handmatige upgrades van `next` en tooling. Zie `npm audit` output voor high/moderate als **backlog**.

## GitHub Actions

- **`ci.yml`** — `npm ci` → Prisma generate → **lint** (incl. security + SonarJS rules) → **build**.
- **`security.yml`** (parallel) — **typecheck** → **audit:deps** → **gitleaks** — geen dubbele lint-run.

Gitleaks kan op bestaande commits falen als er ooit een secret in de repo heeft gestaan; los dat op met key rotation + history cleanup, of tijdelijk de stap tunen (niet aanbevolen).

## Runtime headers

Security headers (CSP, HSTS, `X-Frame-Options`, …) staan in **`next.config.mjs`**, niet in een aparte `middleware.ts` (Next 16 gebruikt `proxy.ts` — zie daar voor request-id en auth-routing).

## LLM-prompts

Prioriteit **P0/P1 eerst** en **minimale diffs** staan in **`docs/CURSOR_MASTER_AUDIT_PROMPT.md`**.

Tooling enforce’t **geen** P0/P1-labels — dat blijft menselijke review + CI op **lint + types + build + audit**.
