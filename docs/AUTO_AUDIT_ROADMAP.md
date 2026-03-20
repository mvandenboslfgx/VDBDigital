# Roadmap: automatische code-audit triggers & geschiedenis

Dit vult `CHATGPT_COMPLETION_HANDOFF.md` aan: **wat je nu handmatig doet** kun je later **gedeeltelijk automatiseren** — zonder te doen alsof een LLM je productie kan “garanderen”.

---

## Wat je al hebt (voldoende voor nu)

- Export: `node scripts/export-for-chatgpt-review.js`
- Twee prompt-niveaus (standaard + advanced) in `docs/CHATGPT_COMPLETION_HANDOFF.md`
- Master prompt met **P0/P1-werkregels** in `docs/CURSOR_MASTER_AUDIT_PROMPT.md`
- CI: `.github/workflows/ci.yml` — lint + build
- Security workflow: `.github/workflows/security.yml` — typecheck + lint + `npm audit --audit-level=critical` + gitleaks — zie **`docs/CI_SECURITY_GATES.md`**

👉 **Advies:** eerst **één volledige advanced audit** → P0/P1 fixen → deploy → herhalen. Pas daarna hieronder investeren.

---

## Fase 1 — Geen LLM, wel automatische “audit bundle”

**Doel:** na elke merge op `main` (of handmatig) staat een **vers export-artefact** klaar om te uploaden — geen vergeten export meer.

- **GitHub Actions:** job die `node scripts/export-for-chatgpt-review.js` draait en `PROJECT_EXPORT_FOR_REVIEW.txt` als **artifact** uploadt (bijv. alleen op `push` naar `main` of `workflow_dispatch`, zodat PR’s niet zwaarder worden).
- **Voordeel:** geen API-kosten, reproduceerbaar, past bij je bestaande CI-mentaliteit.

**Let op:** artifacts verlopen (standaard dagen); dit is bedoeld als **handoff naar jouw LLM-sessie**, niet als permanente database.

---

## Fase 2 — “Grote wijziging” detecteren (padfilters)

**Doel:** alleen dan een zwaardere stap uitvoeren (export-artifact, notificatie, of aparte job).

- In GitHub Actions: `paths` filter op o.a. `modules/**`, `lib/**`, `app/api/**`, `prisma/**`.
- Bij match: zelfde export-artifact of Slack/e-mail “tijd voor advanced audit” (extern kanaal).

Dit is **rule-based**, geen AI in CI — laag risico, hoge signal-to-noise.

---

## Fase 3 — Vercel deploy → trigger (optioneel, complexer)

**Doel:** na productie-deploy wordt iets gestart.

- **Vercel Deploy Hook** of **integration webhook** → roept een **eigen** endpoint of worker aan.
- **Niet** automatisch een volledige codebase naar een LLM sturen vanuit productie (kosten, geheimen, tokenlimiet, compliance).

Realistischer patroon:

- Deploy → trigger alleen **samenvatting**: git SHA, link naar CI-run, artifact van export uit CI — en jij of een interne tool start de LLM-review.

---

## Fase 4 — LLM in de pipeline (alleen met budget & beleid)

Als je ooit **geautomatiseerde** tekstuele review wil:

- **Input beperken**: diff of `git diff main...HEAD` + kritieke paden, niet altijd de hele 1,5 MB export.
- **Secrets**: aparte API-key in GitHub Secrets; geen klantdata in prompts.
- **Fallback**: bij API-storing faalt de job zacht — CI “build groen” blijft de waarheid.

---

## Fase 5 — Audit history in de database (optioneel)

Als je **trends en regressies** wilt vastleggen:

1. Nieuw Prisma-model (conceptueel), bijv. `CodeAuditRun` met o.a. `gitSha`, `summary`, `p0Count`, `p1Count`, `rawPayload Json?`, `createdAt`.
2. Schrijven vanuit CI (via service token) of handmatig na elke review — geen verplichting om alles automatisch te vullen.

**Let op:** JSON met volledige LLM-output kan groot zijn; overweeg truncatie of alleen samenvatting + link naar artifact.

---

## Samenvatting

| Stap | Automatisering | LLM? |
|------|----------------|------|
| Nu | Handmatig export + prompt | Ja, jij triggert |
| Fase 1 | CI artifact export | Nee |
| Fase 2 | Padfilter + notificatie/extra job | Nee |
| Fase 3 | Deploy hook → meta/trigger | Meestal nee |
| Fase 4 | Diff/korte context naar API | Ja, bewust |
| Fase 5 | DB-geschiedenis | Optioneel |

---

*Dit document is bewust geen implementatie: kies een fase als de vorige stabiel voelt.*
