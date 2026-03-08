# VDB Digital — Stripe & Billing

**Brand:** VDB Digital · **Legal entity:** VDB Digital Software.

---

## Plan system

Plans are defined in **`lib/plans.ts`** and stored in the database (`Plan` model) for Stripe sync.

| Plan     | Key      | Monthly price | AI limit | Calculator limit | Projects | Features                    |
|----------|----------|---------------|----------|-------------------|----------|-----------------------------|
| Starter  | `starter`| €0            | 100      | 50                | 3        | calculators, audits         |
| Pro      | `pro`    | €29           | 1000     | 500               | 20       | + aiTools                   |
| Agency   | `agency` | €299          | Unlimited| Unlimited         | Unlimited| + crm                       |

- **DB plan names:** `free` (Starter), `pro`, `agency`. Mapping: `planNameToKey("free")` → `starter`.
- **Feature flags:** `aiTools`, `calculators`, `crm`, `audits`. Used for UI and access control.
- **Usage limits:** Enforced via `lib/usage.ts` — `checkUsageLimit(userId)` compares current usage to plan config.

---

## Webhook flow

**Endpoint:** `POST /api/stripe/webhook`  
**Idempotency:** Every event ID is stored in `ProcessedStripeEvent`. Duplicate events return `200` without reprocessing.

### Events handled

1. **`checkout.session.completed`**
   - Reads `metadata.userId` and subscription.
   - Resolves plan from first line item price ID (`STRIPE_PRICE_ID_PRO` / `STRIPE_PRICE_ID_AGENCY`).
   - Updates `User`: `stripeCustomerId`, `stripeSubscriptionId`, `planId`, `role` (`pro` or `customer` for Agency).
   - Records usage event `subscription_created`.

2. **`customer.subscription.updated`**
   - If status is `active`, resolves plan from price ID and updates all users with that `stripeSubscriptionId`: `planId`, `role`.

3. **`customer.subscription.deleted`**
   - Finds plan `free` in DB and sets users with that subscription to `planId` = free, `stripeSubscriptionId` = null, `role` = `lead`.
   - Records `subscription_cancelled`.

After successful handling, the event ID is inserted into `ProcessedStripeEvent`.

---

## Billing lifecycle

1. **Sign up** → User has no plan or `planId` = free. Role = `lead`.
2. **Upgrade** → User goes to `/pricing` or dashboard billing, chooses Pro/Agency. Frontend calls `POST /api/stripe/create-checkout-session` with `{ plan: "pro" | "agency" }`. User is redirected to Stripe Checkout.
3. **Checkout success** → Stripe redirects to `/dashboard/billing?session_id=…`. Webhook `checkout.session.completed` runs and updates `User.planId` and `role`.
4. **Manage subscription** → User clicks “Stripe-portaal openen” on `/dashboard/billing`. Frontend calls `POST /api/stripe/customer-portal`. User is redirected to Stripe Billing Portal (invoices, payment method, cancel).
5. **Portal return** → Stripe redirects back to `/dashboard/billing`.
6. **Cancel** → User cancels in Stripe Portal. When subscription ends, Stripe sends `customer.subscription.deleted`; webhook sets user back to free plan and role `lead`.

---

## Usage limits

- **Tracking:** `lib/usage.ts`
  - **AI:** Count of `AIUsage` rows for the user in the current month. Call `incrementAiUsage(userId, tool)` when an AI tool is used.
  - **Calculators:** Count of `CalculatorResult` rows for the user in the current month (no separate increment; recording is in `lib/calculators/record.ts`).
  - **Projects:** Count of `Project` where `client.userId` = user (one client per user).
- **Check:** `checkUsageLimit(userId)` returns `{ allowed, usage, limits, planKey, exceeded? }`. Use before allowing an AI run or when displaying billing.
- **Dashboard billing:** `/dashboard/billing` shows current plan (from `lib/plans`), usage vs limits, and link to Stripe Portal.

---

## Environment

- `STRIPE_SECRET_KEY` — Stripe secret key.
- `STRIPE_WEBHOOK_SECRET` — Webhook signing secret (Stripe Dashboard → Webhooks).
- `STRIPE_PRICE_ID_PRO` — Price ID for Pro monthly.
- `STRIPE_PRICE_ID_AGENCY` — Price ID for Agency monthly.

---

*Last updated: Phase 7 implementation.*
