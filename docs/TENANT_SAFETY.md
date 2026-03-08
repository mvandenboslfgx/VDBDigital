# VDB Digital — Tenant safety

**Brand:** VDB Digital · **Legal entity:** VDB Digital Software.

---

## Principle

All queries that fetch user or client data must be **scoped** by:

- **`userId`** — for user-owned data (e.g. `User.id`, usage, preferences).
- **`clientId`** — for client-owned data (e.g. `Project`, `Invoice`, `Website`), where the client is linked to a user via `Client.userId`.

**Admin-only** routes may list all users, clients, or projects; these are protected by `requireUser("admin")` and must remain under `/admin` and `app/api/admin/*`.

---

## Where to apply

| Area | Scope | Notes |
|------|--------|--------|
| Dashboard APIs | `userId` from `getCurrentUser()` | Every query must filter by `user.id` (or via `Client` where `client.userId = user.id`). |
| Portal APIs | `userId` → `clientId` | Resolve `Client` by `userId`; then scope `Project`, `Invoice`, etc. by `clientId`. |
| AI / calculators | `userId` | Record usage and results with `userId`; list only current user's data. |
| Admin APIs | No tenant scope | Allowed to list all; must still use `requireUser("admin")`. |

---

## Patterns

- **User data:** `prisma.user.findUnique({ where: { id: userId } })` or `findFirst` with `where: { id: userId }`. Never `findMany` without `where` outside admin.
- **Client data:** Resolve client by `userId`: `prisma.client.findFirst({ where: { userId } })`, then use `client.id` for projects, invoices, etc.
- **Usage:** `AIUsage`, `CalculatorResult`, `AuditHistory` — always filter by `userId` when returning lists.

---

## Review checklist

When adding or changing API routes:

1. Does this route return data for the current user only? If yes, ensure every Prisma query includes `where: { userId }` or equivalent (e.g. `where: { client: { userId } }`).
2. Is this route admin-only? If yes, ensure `requireUser("admin")` is called and no tenant scope is required.
3. Never expose another user's data by ID (e.g. `/api/users/:id` without checking `id === currentUser.id` or admin).

---

*Last updated: Phase 8.*
