/**
 * Subscription vs one-time revenue calculator.
 * Compares recurring revenue (MRR → ARR) with one-time sales and annual churn.
 * Used for "Subscription vs one-time revenue" in the dashboard.
 */

export interface SubscriptionVsOneTimeInput {
  /** Monthly recurring revenue (€). */
  mrr: number;
  /** Annual churn as a percentage (e.g. 5 for 5%). */
  churnPercent: number;
  /** One-time deal price (€). */
  oneTimePrice: number;
  /** Number of one-time deals per year. */
  oneTimeDealsPerYear: number;
}

export interface SubscriptionVsOneTimeResult {
  /** Annual recurring revenue (MRR × 12). */
  annualRecurring: number;
  /** One-time revenue per year (oneTimePrice × oneTimeDealsPerYear). */
  oneTimeRevenue: number;
  /** Estimated annual churn loss (ARR × churnPercent/100). */
  annualChurnLoss: number;
  /** ARR after churn (annualRecurring - annualChurnLoss). */
  arrAfterChurn: number;
  /** Whether inputs were valid. */
  isValid: boolean;
}

/**
 * Compare subscription ARR with one-time revenue and churn impact.
 * Safe: returns zeros and isValid false on invalid input.
 */
export function calculateSubscriptionVsOneTime(
  input: SubscriptionVsOneTimeInput
): SubscriptionVsOneTimeResult {
  const { mrr, churnPercent, oneTimePrice, oneTimeDealsPerYear } = input;

  const validMrr = Number.isFinite(mrr) && mrr >= 0;
  const validChurn = Number.isFinite(churnPercent) && churnPercent >= 0 && churnPercent <= 100;
  const validPrice = Number.isFinite(oneTimePrice) && oneTimePrice >= 0;
  const validDeals = Number.isFinite(oneTimeDealsPerYear) && oneTimeDealsPerYear >= 0;

  if (!validMrr || !validChurn || !validPrice || !validDeals) {
    return {
      annualRecurring: 0,
      oneTimeRevenue: 0,
      annualChurnLoss: 0,
      arrAfterChurn: 0,
      isValid: false,
    };
  }

  const annualRecurring = mrr * 12;
  const oneTimeRevenue = oneTimePrice * oneTimeDealsPerYear;
  const churnPct = Math.min(100, Math.max(0, churnPercent)) / 100;
  const annualChurnLoss = annualRecurring * churnPct;
  const arrAfterChurn = annualRecurring - annualChurnLoss;

  return {
    annualRecurring,
    oneTimeRevenue,
    annualChurnLoss,
    arrAfterChurn,
    isValid: true,
  };
}
