# Dependency policy (VDB Digital)

Doel: **reproduceerbare builds** — lokaal, CI en Vercel volgen dezelfde `package-lock.json`.

## Wat we vastzetten (exact, geen `^`)

Runtime- en tool-kern waar breaking changes het meest pijn doen:

| Pakket | Reden |
|--------|--------|
| `next` | Framework |
| `react`, `react-dom` | Moeten samen matchen |
| `prisma`, `@prisma/client` | **Moeten dezelfde versie** hebben |
| `typescript` | Compiler |
| `eslint` | Lint-regels stabiel houden |
| `@next/eslint-plugin-next` | Liefst gelijk aan `next` major/minor |

## Wat semver ranges gebruikt (`^`)

Onder andere: UI-hulp, integraties, kleinere libs — patches/minor via Dependabot + lockfile.

## Lockfile

- **`package-lock.json` is de bron van waarheid** voor exacte versies.
- In CI: **`npm ci`** (niet `npm install`) — al zo ingesteld in `.github/workflows/ci.yml` en `security.yml`.
- Direct na `npm ci`: **`npm ls --depth=0`** — faalt snel bij een kapotte boom, peer conflicts of inconsistenties (exit code ≠ 0).

## Strategie: exact voor core (lockfile-aligned)

Voor **Next / React / Prisma** houden we **exacte** versies in `package.json` die overeenkomen met wat in de lockfile bewezen werkt. Patches/security komen bewust binnen via Dependabot-PR’s, niet door losse `^` op de kern tenzij je dat later bewust kiest.

## Geen willekeurige major-downgrades

Voorbeelden in discussies (bijv. Next 15 + React 18 + Prisma 5) zijn **niet** automatisch overgenomen: dit project blijft op de huidige major-lijn totdat er een bewuste migratie is.

## Nieuwe packages toevoegen

Door `.npmrc` (`save-prefix=` leeg) krijgen nieuwe dependencies **zonder** automatische `^` in `package.json`, tenzij je bewust een range kiest.

## Dependabot

Zie `.github/dependabot.yml`:

- `versioning-strategy: increase` — updates blijven **lockfile-aligned** met `package.json`.
- `open-pull-requests-limit: 3` — minder PR-spam.
- **Groepen** (volgorde = eerste match wint): `core` (next/react), `prisma`, `tooling` (eslint/typescript), daarna brede prod- en dev-buckets voor de rest.
- Per-group labels bestaan **niet** in Dependabot; gebruik PR-titel/`deps`-prefix of **branch protection rules** op labels (zie hieronder).

## Upgrade Validation workflow

`.github/workflows/upgrade-validation.yml` draait op **PR’s naar `main`** als `package.json` of `package-lock.json` wijzigt:

| Stap | Doel |
|------|------|
| `npm ci` + `npm ls --depth=0` | Reproduceerbare install + peer/conflict detectie |
| `prisma validate` | Schema/config OK |
| `typecheck` | TS OK |
| `npm run build` (met productie-env placeholders) | Zelfde klasse fouten als Vercel-build |
| `scripts/check-core-updates.js` | **Policy**: wijziging van `next` / `react` / `react-dom` / `prisma` / `@prisma/client` in `package.json` → **exit 1** (handmatige review; blokkeert “blinde” merge als check required is) |
| `npm outdated \|\| true` | Alleen informatie |

Bij **succes** (inclusief core-policy) plaatst de workflow een **samenvattende PR-comment** (idempotent via HTML-marker).

### GitHub-instellingen (aanbevolen)

- **Branch protection** op `main`: required status checks voor `Upgrade Validation` en je bestaande CI.
- Voor **core bumps**: merge na review, of tijdelijk **admin merge** als beleid dat is afgesproken.
- **Auto-merge**: niet inschakelen voor PR’s die alleen dependency updates zijn zonder review, of exclude Dependabot via team policy.
- Label **`core-update`** wordt automatisch gezet bij wijziging van `next` / `react` / `react-dom` / `prisma` / `@prisma/client` in `package.json` (diff base ↔ head). Gebruik in branch rules of filters.
- **Soft mode:** repository variable `UPGRADE_CORE_POLICY_SOFT=true` → geen `exit 1` op core bumps (wel label + logs). Zie **[UPGRADE_PIPELINE.md](./UPGRADE_PIPELINE.md)**.
