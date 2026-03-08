# Email module

Transactional emails for onboarding and product.

## Functions

- **sendWelcomeEmail(user)** — After signup. Uses SMTP from env.
- **sendUpgradeConfirmation(user)** — After plan change. Optional `planName` on user.
- **sendAuditReport(email, report)** — Wraps `lib/email.sendAuditReportEmail` for audit report delivery.

All functions return `boolean` (success). Failures are logged; they do not throw.
