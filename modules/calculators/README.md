# Calculators module

Business calculators for the VDB Digital dashboard. All logic is pure functions: input object in, result object out. Safe against division by zero and NaN.

## Calculators (7)

| Name | File | Prisma type |
|------|------|-------------|
| ROI | re-exported from `lib/calculators/roi` | `roi` |
| Break-even | re-exported from `lib/calculators/breakEven` | `breakEven` |
| Price increase profit | `priceIncrease.ts` | `priceIncrease` |
| Subscription vs one-time | `subscriptionVsOneTime.ts` | `subscriptionVsOneTime` |
| Freelancer minimum rate | `freelancerRate.ts` | `freelancerRate` |
| Discount impact | re-exported from `lib/calculators/discount` | `discountImpact` |
| Finance check (loan) | `financeCheck.ts` | `financeCheck` |

## Usage

Import from the module index only:

```ts
import {
  calculateRoi,
  calculateBreakEven,
  calculatePriceIncrease,
  calculateSubscriptionVsOneTime,
  calculateFreelancerRate,
  calculateDiscountImpact,
  calculateFinanceCheck,
} from "@/modules/calculators";
```

Recording is done via `POST /api/calculators/record` with `type` matching Prisma `CalculatorType` and `inputs`/`result` as returned by these functions.

## Pattern

Each calculator exposes:

- `XxxInput` – TypeScript interface for inputs
- `XxxResult` – TypeScript interface for results (includes `isValid` where applicable)
- `calculateXxx(input: XxxInput): XxxResult` – pure function, no side effects

Validation: invalid inputs yield safe defaults (e.g. zeros) and `isValid: false` where defined.
