# Audit logging

Important events are written to the `AuditLog` table for compliance and debugging.

## Location

- **Library:** `lib/auditLog.ts`
- **Model:** `AuditLog` in `prisma/schema.prisma`

## Event types

| Event | When | Convenience function |
|-------|------|----------------------|
| `user_signup` | New user created (auth sync) | `auditUserSignup(userId, email?)` |
| `plan_upgrade` | Checkout completed or subscription updated | `auditPlanUpgrade(userId, planName, metadata?)` |
| `ai_tool_used` | AI tool usage recorded | `auditAiToolUsed(userId?, tool, metadata?)` |
| `calculator_used` | Calculator result recorded | `auditCalculatorUsed(userId?, calculatorType, metadata?)` |
| `admin_action` | Admin performs an action | `auditAdminAction(adminUserId, action, metadata?)` |

## Usage

- **Generic:** `writeAuditLog({ event, userId?, metadata? })`
- **Convenience:** Use the helpers above so event names and metadata stay consistent.

Writing is fire-and-forget: failures are logged but do not throw, so callers are not blocked.

## Integration points

- **Auth:** `lib/auth.ts` calls `auditUserSignup` after creating a new user.
- **Stripe webhook:** `auditPlanUpgrade` on checkout.session.completed and customer.subscription.updated.
- **Usage:** `lib/usage.ts` `incrementAiUsage` calls `auditAiToolUsed`.
- **Calculators:** `lib/calculators/record.ts` `recordCalculatorResult` calls `auditCalculatorUsed`.
- **Admin:** Admin API routes can call `auditAdminAction(adminUserId, action, metadata)` for sensitive actions.

## Schema

```prisma
model AuditLog {
  id        String   @id @default(uuid())
  event     String
  userId    String?
  metadata  Json?    @default("{}")
  createdAt DateTime @default(now())
  @@index([event])
  @@index([userId])
  @@index([createdAt])
}
```

Run `npx prisma migrate dev` to apply the migration for `AuditLog`.
