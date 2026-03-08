# Leads module

Lead capture for the growth layer. When a user runs a website audit (with email), we capture the lead and report in one place.

## auditLead

- **`captureAuditLead(input, auditResult, userId?)`** — Creates or updates `Lead`, creates `AuditReport`. If `userId` is provided, also increments audit count, creates `LeadScore` and `AuditHistory`, and records a usage event.
- Used by `POST /api/ai/website-audit` when `fullReport` is true (email provided). Email sending remains in the route.

## Input

- `email`, `name?`, `company?`, `website`
- `auditResult`: `FullAuditResult` from `lib/ai-website-audit`
