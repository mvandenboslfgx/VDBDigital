# Cache policy (Redis + in-memory)

## TTLs (`lib/cache-policy.ts`)

| Key pattern | TTL | Use |
|-------------|-----|-----|
| `control-center:live` | 12s | Owner control center (global) |
| `analytics:{userId}` | 90s | `/dashboard/analytics` bundle |
| `dashboard:{userId}` | 45s | Main user dashboard home |
| `REVENUE` / `GROWTH` | 60s / 120s | Reserved for revenue/growth aggregates |

## Invalidation (`lib/cache-invalidation.ts`)

- **`onPlatformActivity({ userId? })`** — invalidates control center + optional user caches.
- Wired after **audit report created** (`captureAuditLead`) and **Stripe** events (checkout, subscriptions, invoice paid, subscription deleted).

## Adaptive polling

- **Control center** client: **10s** when tab visible, **60s** when hidden (`hooks/useAdaptivePollingInterval.ts`).

## Notes

- Without `REDIS_URL`, `getOrSet` uses **in-memory** (single instance only — fine for dev/single server).
- WebSocket/realtime is optional; invalidation keeps polling + short TTL honest.
