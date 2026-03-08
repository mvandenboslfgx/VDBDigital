# VDB Digital — Modules

Feature-oriented modules for the VDB Digital SaaS platform. Each module typically contains:

- **`logic.ts`** — Business logic and calculations.
- **`api.ts`** — Server-side API helpers (e.g. calling external services).
- **`types.ts`** — TypeScript types and interfaces.
- **`components/`** — React components specific to this feature (optional).

API routes under `app/api/` remain thin and delegate to these modules.

---

## Module index

| Module | Purpose |
|--------|---------|
| **ai-audit** | AI website audit: scores, recommendations, report generation. |
| **ai-builder** | AI landing-page / site builder. |
| **ai-copy** | AI copy generator. |
| **seo-analyzer** | SEO analysis logic and API. |
| **competitor-analyzer** | Competitor analysis (form, result, section components). |
| **funnel-generator** | Funnel builder / funnel generation. |
| **crm** | CRM types and logic (projects, clients, analytics widgets). |
| **analytics** | Analytics types, API, and logic. |
| **deploy** | Deploy-related logic and API. |
| **calculators** | Business calculators (ROI, break-even, price increase, subscription vs one-time, freelancer rate, discount impact, finance check). Pure functions; dashboard imports from `@/modules/calculators`. |

---

## Adding a new module

1. Create a folder under `modules/<module-name>/`.
2. Add `logic.ts`, `types.ts`, and optionally `api.ts` and `components/`.
3. Keep UI-agnostic logic in the module; use `lib/` for shared utilities (auth, DB, Stripe, etc.).
4. Register the module in this README and in `docs/STRUCTURE.md` if it affects app routes.

---

**Brand:** VDB Digital · **Legal entity:** VDB Digital Software.
