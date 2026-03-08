# AI Marketing SaaS — New Components & Routes

Summary of what was added. **Existing functionality is unchanged.**

---

## New routes (pages)

| Route | Description |
|-------|-------------|
| `/report/[slug]` | **Viral report page.** Public page for a shared report. `slug` = report UUID or share slug. Shows score, top insights, share buttons (Twitter, LinkedIn, copy link). **Lead capture:** email required to unlock full report (must match lead email). SEO-friendly metadata. |
| `/dashboard/websites` | **My websites.** List user's website projects (domain), add new domain, view scan history and **score trend graph** per project. Links to start scan and latest report. |
| `/website-audit-tool` | **SEO landing:** Website-audit tool. CTA to `/tools/website-audit`. |
| `/seo-keyword-tool` | **SEO landing:** SEO Keyword Finder. CTA to `/tools/seo-keyword-finder`. |
| `/ai-copy-generator` | **SEO landing:** AI Copy Generator. CTA to `/tools/copy-optimizer`. |

---

## New API routes

| Method | Route | Description |
|--------|--------|-------------|
| GET | (report page) | Server component fetches report by id or `shareSlug`. |
| POST | `/api/report/unlock` | **Lead capture.** Body: `{ reportId, email }`. Validates email matches report lead; returns success so client can show full report. |
| POST | `/api/report/share` | **Share report.** Auth required. Body: `{ reportId }`. Creates or returns `shareSlug`, returns `shareUrl` (e.g. `/report/abc123`). |
| GET | `/api/projects` | **List website projects.** Auth required. Returns user's `WebsiteProject[]` with `_count.auditHistories`. |
| POST | `/api/projects` | **Create website project.** Auth required. Body: `{ domain }`. Creates `WebsiteProject` for user. |
| GET | `/api/usage/stats` | **Usage dashboard.** Auth required. Returns `{ scansUsed, scansLimit, reportsGenerated, aiUsage, aiLimit }` for current month. |

---

## New components

| Component | Path | Description |
|-----------|------|-------------|
| `ReportPublicClient` | `components/report/ReportPublicClient.tsx` | Client for `/report/[slug]`: score, ScoreRings, top insights, share buttons, email gate, full summary + improvements when unlocked. |
| `ShareButtons` | `components/report/ShareButtons.tsx` | Twitter, LinkedIn, copy-link for report URL. |
| `WebsiteProjectsClient` | `components/dashboard/WebsiteProjectsClient.tsx` | Add domain form, list projects, scan history, link to report. |
| `ScoreTrendChart` | `components/dashboard/ScoreTrendChart.tsx` | Simple bar chart of score over time (last 14 scans). |
| `UsageDashboard` | `components/dashboard/UsageDashboard.tsx` | Displays scans used, reports generated, AI usage (calls `/api/usage/stats`). |
| `ShareReportButton` | `components/dashboard/ShareReportButton.tsx` | Button on report detail: create share link, copy to clipboard. |

---

## Schema (Prisma)

- **WebsiteProject** — `id`, `userId`, `domain`, `createdAt`. Unique `(userId, domain)`. User’s list of websites.
- **AuditReport** — Added `shareSlug` (optional, unique), `improvements` (JSON, optional).
- **AuditHistory** — Added `websiteProjectId` (optional FK to WebsiteProject), `improvements` (JSON, optional).
- **User** — Added `onboardingStep` (Int, default 0).
- **AgencyBranding** — `userId`, `logoUrl`, `companyName`, `primaryColor` (for white-label reports).
- **Team** — `ownerId`, `name`. **TeamMember** — `teamId`, `userId`, `role`. **TeamInvite** — `teamId`, `email`, `role`, `token`, `expiresAt`.

Migration: `prisma/migrations/20260309000000_website_project_share_teams/migration.sql`.  
Run: `npx prisma migrate deploy` (or apply the SQL manually). Then `npx prisma generate`.

---

## Existing behaviour preserved

- PDF export: still at `GET /api/reports/audit-pdf?reportId=...` (unchanged).
- Dashboard reports, audits, billing, settings: unchanged.
- `/dashboard/projects` still shows **client** projects (agency); **user** websites are on `/dashboard/websites`.
- Lead capture on report page: only the email that requested the scan can unlock the full report.

---

## Not implemented in this pass

- **White-label reports** (agency logo, branding): schema and models added; UI for logo upload and PDF branding not implemented.
- **Team members / invites**: schema added; no UI for inviting members or accepting invites yet.
- **AI fix generator**: `improvements` JSON on report/history is in place; no API or UI yet that generates per-improvement “fix” text.
- **Tool recommendations**: no post-scan “recommended tools” component yet.
- **Onboarding flow**: `onboardingStep` added on User; existing onboarding component is unchanged; no new steps (scan → report → tools) added.

These can be added in a follow-up.
