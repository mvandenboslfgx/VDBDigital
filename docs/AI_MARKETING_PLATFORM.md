# AI Marketing Platform — Implementation Summary

Transformation from a single website-audit tool to a full **AI Marketing Toolkit** with multiple tools, new pricing, and automatic language detection.

---

## 1. Summary of changes

### Tools & routes
- **`/tools`** — Index page with cards for all 7 tools (icon, title, description, CTA).
- **`/tools/website-audit`** — Improved audit tool: form, scores (SEO, Performance, UX, Conversion), content-quality signals, AI advice.
- **`/tools/seo-keyword-finder`** — Input: website URL or keyword → AI: keyword ideas, search intent, content suggestions.
- **`/tools/conversion-analyzer`** — Input: URL → CTA clarity, trust signals, page structure, form optimization, improvements.
- **`/tools/copy-optimizer`** — Input: pasted text → improved copy, headlines, CTAs, readability.
- **`/tools/competitor-analyzer`** — Input: competitor URL → SEO, content, UX, conversion, advantages, improvements.
- **`/tools/performance-check`** — Input: URL → PageSpeed LCP, CLS, FID, score, tips.
- **`/tools/content-generator`** — Input: topic → SEO blog article, meta title, meta description, headings.

### Design system
- **`ToolCard`** — Card for tools index (title, description, link).
- **`ToolLayout`** — Wrapper for tool pages (back link, title, description, optional UpgradeBanner).
- **`ResultPanel`** — Result block with optional title.
- **`UpgradeBanner`** — CTA to /pricing.
- **`MetricCard`** — Already present; used in tools and dashboard.

### API routes (new)
- `POST /api/ai/seo-keyword-finder` — Body: `{ website?, keyword? }` → keyword ideas + intent + content suggestions.
- `POST /api/ai/conversion-analyzer` — Body: `{ url }` → CTA, trust, structure, forms, improvements.
- `POST /api/ai/copy-optimizer` — Body: `{ text }` → improvedCopy, headlines, ctas, readabilityTips.
- `POST /api/ai/competitor-website` — Body: `{ url }` → seo, content, ux, conversion, advantages, improvements.
- `POST /api/ai/performance-check` — Body: `{ url }` → score, lcp, cls, fid, tips (PageSpeed).
- `POST /api/ai/content-generator` — Body: `{ topic }` → metaTitle, metaDescription, headings, article.

### Pricing model
- **Free** — 1 scan/month.
- **Starter €29** — 25 scans, AI tools.
- **Growth €79** — 150 scans, more AI.
- **Agency €199** — 500 scans, CRM.
- `lib/plans.ts`: `PlanKey` = `free | starter | growth | agency`; `scansPerMonth` and limits updated.
- `lib/audit-limits.ts`: limits 1 / 25 / 150 / 500.
- `prisma/seed.ts`: plans free, starter, growth, agency (prices in cents: 0, 2900, 7900, 19900).
- Stripe: `resolvePlanFromPriceId` and create-checkout use `STRIPE_PRICE_ID_STARTER`, `_GROWTH`, `_AGENCY` (legacy PRO/BUSINESS still supported).
- Pricing page, PricingStrip, UpgradeCheckoutButton: show Free, Starter, Growth, Agency.

### Language
- **Language switcher removed** from Navbar.
- **Automatic detection**: middleware reads `Accept-Language`; if `NEXT_LOCALE` cookie is missing, sets it to first matching `nl` / `en` / `de` (default `nl`).
- Preference stored in cookie `NEXT_LOCALE` (path `/`, 1 year).

### Landing & dashboard
- **Landing**: New section “AI Marketing Toolkit” (tools overview + link to `/tools`). Hero and WebsiteScanSection unchanged. PricingStrip updated to new plans.
- **Navbar**: “Tools” link added (i18n key `nav.tools`).
- **Dashboard**: “AI Marketing Tools” card linking to `/tools`; quick scan, recent reports, usage stats, upgrade prompt unchanged.

### Existing behaviour
- Website-audit API and dashboard audits/reports unchanged.
- Auth, Stripe webhook, admin, chat, i18n (nl/en/de) unchanged.
- Legacy plan names `pro` / `business` in DB still map to starter/growth in code.

---

## 2. List of created pages

| Route | Description |
|-------|-------------|
| `/tools` | Tools index: 7 tool cards |
| `/tools/website-audit` | Website audit form + scores + content + AI advice |
| `/tools/seo-keyword-finder` | SEO keyword finder form + results |
| `/tools/conversion-analyzer` | Conversion analyzer form + results |
| `/tools/copy-optimizer` | Copy optimizer form + results |
| `/tools/competitor-analyzer` | Competitor (URL) analyzer form + results |
| `/tools/performance-check` | Performance check form + Core Web Vitals + tips |
| `/tools/content-generator` | Content generator form + meta + article |

---

## 3. List of API routes

| Method | Route | Purpose |
|--------|--------|---------|
| POST | `/api/ai/seo-keyword-finder` | Keyword ideas from website or keyword |
| POST | `/api/ai/conversion-analyzer` | CTA, trust, structure, forms from URL |
| POST | `/api/ai/copy-optimizer` | Optimize pasted copy (headlines, CTAs, readability) |
| POST | `/api/ai/competitor-website` | Analyze competitor URL (SEO, content, UX, conversion) |
| POST | `/api/ai/performance-check` | PageSpeed LCP, CLS, FID, score, tips |
| POST | `/api/ai/content-generator` | SEO article + meta from topic |

Existing AI routes (e.g. `/api/ai/website-audit`, `/api/ai/audit`, `/api/ai/copy`, `/api/ai/competitor-analyzer`, etc.) are unchanged.

---

## 4. Manual setup steps

1. **Database**
   - Run: `npx prisma migrate deploy` (if you add migrations).
   - Run: `npx prisma db seed` to create/update plans: **free**, **starter**, **growth**, **agency** (replace or add to existing plans depending on your schema).

2. **Stripe**
   - Create products/prices in Stripe: **Starter €29/mo**, **Growth €79/mo**, **Agency €199/mo**.
   - Set in `.env`:
     - `STRIPE_PRICE_ID_STARTER=price_...`
     - `STRIPE_PRICE_ID_GROWTH=price_...`
     - `STRIPE_PRICE_ID_AGENCY=price_...`
   - Webhook URL and events unchanged; `resolvePlanFromPriceId` supports both new and legacy price IDs.

3. **OpenAI**
   - New AI routes use `OPENAI_API_KEY`; ensure it is set.

4. **PageSpeed (performance check)**
   - Optional: `PAGESPEED_API_KEY` for higher quota. Without it, performance-check still works with default quota.

5. **Locale**
   - No manual step. First visit sets `NEXT_LOCALE` from `Accept-Language` (nl/en/de). Users can change language later via cookie or a future settings UI if you add one.

6. **Existing users**
   - Users with plan `pro` or `business` continue to work; they are treated as starter/growth in limits and display. For new subscriptions, use Stripe prices for starter/growth/agency.
