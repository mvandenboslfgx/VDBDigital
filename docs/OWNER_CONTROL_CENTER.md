# Owner Control Center

The Owner Control Center is a secure, owner-only admin panel for the VDB Digital SaaS platform. It provides full visibility and control over users, leads, finances, AI usage, plans, analytics, system health, and audit logs.

## Access

- **Role:** Only users with role `owner` can access the control center routes.
- **Auto-assignment:** Users whose email is in `OWNER_EMAILS` (env or hardcoded in `lib/permissions.ts`) are automatically assigned the `owner` role on login/signup.
- **Hardcoded owner emails:** `info@vdbdigital.nl`, `matthijsvandenbos8@gmail.com` (see `lib/permissions.ts`).

## Routes (owner-only)

| Route | Description |
|------|-------------|
| `/admin/control-center` | Dashboard: MRR, revenue, active users, new users/leads today, AI requests/cost, platform status |
| `/admin/users` | User table: change plan, role, disable, delete |
| `/admin/leads` | Leads table: convert to user, send email, delete |
| `/admin/finance` | Revenue, MRR, Stripe fees, AI costs, hosting cost, profit |
| `/admin/ai-usage` | AI usage by tool: requests, cost, last used; totals for today |
| `/admin/plans` | Edit plans: price, aiLimit, calculatorLimit, projectLimit (via Plan features JSON) |
| `/admin/analytics` | Charts: users growth, MRR growth, audits per day, AI requests per day |
| `/admin/system` | Health: database, Stripe key, OpenAI key, email service (OK / WARNING / ERROR) |
| `/admin/logs` | Audit log table: event, user, metadata, timestamp |
| `/admin/settings` | Links to existing admin settings |

If a non-owner (e.g. `admin`) visits any of these paths, they are redirected to `/dashboard`.

## Permissions

- **`lib/permissions.ts`**
  - `OWNER_EMAILS`: hardcoded list of owner emails.
  - `isOwner(user)`: type guard for owner role.
  - `requireOwner()`: in `lib/auth.ts`; returns current user if owner, else `null`.
  - `isOwnerPath(path)`: true for the owner-only routes above.

- **Middleware** (`middleware.ts`): For paths matching `isOwnerPath()`, the user's role must be `owner` (from `/api/auth/me`). Otherwise redirect to `/dashboard`.

## Security

- All owner routes and APIs verify `requireOwner()` (or equivalent).
- Sensitive actions (user update/delete, lead delete, plan update) are logged via `writeAuditLog` / `auditAdminAction` (event `admin_action` with metadata).

## APIs

| Method | Route | Description |
|--------|-------|-------------|
| PATCH | `/api/admin/users/update` | Update user role, planId, disabledAt (owner only). |
| DELETE | `/api/admin/users/delete?userId=` | Delete user (owner only). Cannot delete owner. |
| POST | `/api/admin/leads/send-email` | Send email to lead (owner only). |
| DELETE | `/api/admin/leads/delete?leadId=` | Delete lead (owner only). |
| PATCH | `/api/admin/plans/update` | Update plan price and features (aiLimit, calculatorLimit, projectLimit) (owner only). |

## UI

- **Owner sidebar** (`components/admin/OwnerSidebar.tsx`): Shown in the admin layout when the current user is owner. Lists Dashboard (control-center), Users, Leads, Finance, AI Usage, Plans, Analytics, System, Logs, Settings.
- **MetricCard** (`components/admin/MetricCard.tsx`): Reusable card for control center and finance (label, value, optional subtext, trend, status).
- Tailwind-based layout; responsive tables and grids.

## Environment

- `OWNER_EMAILS`: Optional comma-separated emails that get owner role (overrides hardcoded list if set).
- `HOSTING_COST_EUR`: Optional number used on the finance page for total costs and profit.

## Database

- **UserRole** enum includes `owner` (and `lead`, `customer`, `pro`, `admin`).
- **User.disabledAt**: Optional timestamp; when set, user is considered disabled (owner can set via Users page).
- **Plan.features**: JSON; used to store `aiLimit`, `calculatorLimit`, `projectLimit` for the Plans management page.

## Structure summary

```
app/admin/
  control-center/page.tsx   # Owner dashboard
  users/page.tsx           # Owner users table + actions
  leads/page.tsx           # Owner leads table + actions
  finance/page.tsx        # Finance metrics
  ai-usage/page.tsx       # AI usage by tool
  plans/page.tsx          # Plan editor
  analytics/page.tsx      # Charts
  system/page.tsx         # System health
  logs/page.tsx           # Audit logs
app/api/admin/
  users/update/route.ts
  users/delete/route.ts
  leads/send-email/route.ts
  leads/delete/route.ts
  plans/update/route.ts
components/admin/
  OwnerSidebar.tsx
  MetricCard.tsx
  UserActions.tsx
  LeadActions.tsx
  PlanEditor.tsx
lib/
  permissions.ts   # OWNER_EMAILS, isOwner, isOwnerPath, canAccessOwnerRoutes
  auth.ts          # getOwnerEmails, requireOwner, owner role assignment
```
