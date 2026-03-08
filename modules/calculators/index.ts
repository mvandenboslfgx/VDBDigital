/**
 * VDB Digital — Business calculators module.
 * Single entry point for all 7 calculators. Dashboard and API should import from here.
 *
 * Calculators:
 * - ROI
 * - Break-even
 * - Price increase profit
 * - Subscription vs one-time revenue
 * - Freelancer minimum hourly rate
 * - Discount impact
 * - Finance check (loan)
 */

// Existing calculators (lib) — re-export so dashboard imports from modules only
export {
  calculateRoi,
  type RoiInput,
  type RoiResult,
} from "@/lib/calculators/roi";
export {
  calculateBreakEven,
  type BreakEvenInput,
  type BreakEvenResult,
} from "@/lib/calculators/breakEven";
export {
  calculatePricingImpact,
  type PricingSimulatorInput,
  type PricingSimulatorResult,
} from "@/lib/calculators/pricing";
export {
  calculateDiscountImpact,
  type DiscountImpactInput,
  type DiscountImpactResult,
} from "@/lib/calculators/discount";

// New calculators (this module)
export {
  calculatePriceIncrease,
  type PriceIncreaseInput,
  type PriceIncreaseResult,
} from "./priceIncrease";
export {
  calculateSubscriptionVsOneTime,
  type SubscriptionVsOneTimeInput,
  type SubscriptionVsOneTimeResult,
} from "./subscriptionVsOneTime";
export {
  calculateFreelancerRate,
  type FreelancerRateInput,
  type FreelancerRateResult,
} from "./freelancerRate";
export {
  calculateFinanceCheck,
  type FinanceCheckInput,
  type FinanceCheckResult,
} from "./financeCheck";
