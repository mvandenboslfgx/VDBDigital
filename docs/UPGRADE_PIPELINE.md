# Upgrade pipeline (enterprise discipline)

## Workflows

| Workflow | Wanneer | Gedrag |
|----------|---------|--------|
| **`upgrade-validation.yml`** | PR → `main`, wijziging `package.json` / `package-lock.json` | Volledige keten + governance |

### Stappen (samenvatting)

1. `npm ci` + `npm ls --depth=0`
2. `npx prisma validate` + **`npx prisma generate`**
3. `npm run typecheck`
4. `npm run build` (productie-env placeholders)
5. **Smoke:** `next start` → `GET /robots.txt` (geen DB; vangt start/runtime crashes)
6. `npm outdated \|\| true`
7. **Core diff** (`scripts/check-core-updates.js --ci-report-only`) → step output `core_changed`
8. Bij core-wijziging: label **`core-update`** (wordt aangemaakt indien nodig)
9. **Enforce:** `exit 1` tenzij soft mode (hieronder)
10. Bij succes: PR-comment (upsert)

### Soft mode (geen merge-block op core)

Zet een **repository variable** (Settings → Secrets and variables → Actions → Variables):

- **`UPGRADE_CORE_POLICY_SOFT`** = `true`

Dan: label + rapport blijven, maar de **enforce-stap** slaat over (check wordt groen). Handig voor teams die core-bumps toch willen laten doorlopen na review buiten GitHub om.

### Branch protection

- Maak **`Upgrade Validation`** (job `validate-upgrade`) een **required check** op `main`.
- Optioneel: rule op label **`core-update`** (extra reviewers) — GitHub Enterprise / team policies.

### Forks

PR-comments en labels draaien alleen als `head.repo == github.repository` (geen secrets op forks).

---

Zie ook **[RELEASE_SYSTEM.md](./RELEASE_SYSTEM.md)** voor production deploy, rollback en `/api/health/live`.
