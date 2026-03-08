# VDB Digital — Role-Based Access Control (RBAC)

**Brand:** VDB Digital · **Legal entity:** VDB Digital Software.

---

## Roles

| Role | Description |
|------|-------------|
| **lead** | New or unqualified lead; can use limited dashboard (e.g. scans with limits), no AI tools or full reports. |
| **pro** | Paying Pro plan; full dashboard: audits, AI tools, calculators, reports. |
| **customer** | Agency/customer; dashboard + projects, reports, portal access where applicable. |
| **admin** | Full access to `/admin`: users, leads, clients, projects, invoices, newsletter, analytics, AI usage, settings. |

Role is stored on `User.role` (Prisma). First user or emails in `OWNER_EMAILS` become admin; others start as lead. Stripe subscription can promote to pro/customer via webhook.

---

## Route access

| Area | Path | Allowed roles |
|------|------|---------------|
| Dashboard | `/dashboard/*` | lead, pro, customer (content varies by role) |
| Portal | `/portal/*` | customer (and linked user) |
| Admin | `/admin/*` | admin only |

Middleware ensures only **signed-in** users reach dashboard, portal, and admin; non-admins must be redirected from `/admin` (layout and middleware enforce this).

---

## API access

- **Dashboard/Portal APIs:** Require authenticated user via `getCurrentUser()`; some actions restricted by role (e.g. portal project list for customer).
- **Admin APIs:** Every handler under `app/api/admin/*` must call `requireUser("admin")` and return 403 when not admin.
- **Stripe/Auth:** Checkout and customer portal require authenticated user; webhooks are signed and idempotent.

---

## Implementation

- **Auth helpers:** `lib/auth.ts` — `getCurrentUser()`, `requireUser(role?)`. Role is read from the database user record (Prisma `User.role`).
- **Permission system:** `lib/permissions.ts` — Central route access rules and helpers:
  - `canAccessAdmin(user)` — only `role === "admin"` may access `/admin`.
  - `canAccessDashboard(user)` — all authenticated roles may access `/dashboard`.
  - `canAccessPortal(user)` — only `role === "customer"` may access `/portal`.
  - Route prefixes: `ADMIN_ROUTES`, `DASHBOARD_ROUTES`, `PORTAL_ROUTES`; path helpers: `isAdminPath()`, `isDashboardPath()`, `isPortalPath()`.
- **Middleware:** `middleware.ts` — (1) Unauthenticated users hitting `/dashboard`, `/portal`, or `/admin` are redirected to `/login`. (2) Authenticated users hitting `/admin` must have `role === "admin"`; otherwise they are redirected to `/dashboard`.
- **Admin layout:** `app/admin/layout.tsx` uses `canAccessAdmin(currentUser)` and redirects non-admins to `/dashboard`.

---

*Last updated: Phase 1 implementation (central permissions, middleware role check, admin layout guard).*
