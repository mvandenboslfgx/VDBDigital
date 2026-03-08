/**
 * Freelancer minimum hourly rate calculator.
 * Computes the minimum rate needed to cover expenses and desired profit margin.
 * Used for "Freelancer minimum hourly rate" in the dashboard.
 */

export interface FreelancerRateInput {
  /** Annual expenses (€). */
  annualExpenses: number;
  /** Billable weeks per year. */
  billableWeeks: number;
  /** Billable hours per week. */
  hoursPerWeek: number;
  /** Desired profit margin as percentage (e.g. 20 for 20%). */
  profitMarginPercent: number;
}

export interface FreelancerRateResult {
  /** Total billable hours per year. */
  totalBillableHours: number;
  /** Minimum revenue needed (expenses / (1 - margin)). */
  minRevenue: number;
  /** Minimum hourly rate (€/hr). */
  minHourlyRate: number;
  /** Whether inputs were valid (margin < 100, hours > 0). */
  isValid: boolean;
}

/**
 * Calculate minimum freelancer hourly rate to cover costs and target margin.
 * Safe: avoids division by zero (margin >= 100 or totalHours <= 0).
 */
export function calculateFreelancerRate(input: FreelancerRateInput): FreelancerRateResult {
  const { annualExpenses, billableWeeks, hoursPerWeek, profitMarginPercent } = input;

  const validExpenses = Number.isFinite(annualExpenses) && annualExpenses >= 0;
  const validWeeks = Number.isFinite(billableWeeks) && billableWeeks > 0;
  const validHours = Number.isFinite(hoursPerWeek) && hoursPerWeek > 0;
  const validMargin =
    Number.isFinite(profitMarginPercent) &&
    profitMarginPercent >= 0 &&
    profitMarginPercent < 100;

  if (!validExpenses || !validWeeks || !validHours || !validMargin) {
    return {
      totalBillableHours: 0,
      minRevenue: 0,
      minHourlyRate: 0,
      isValid: false,
    };
  }

  const totalBillableHours = billableWeeks * hoursPerWeek;
  const marginPct = Math.min(99.99, Math.max(0, profitMarginPercent)) / 100;
  const minRevenue = annualExpenses / (1 - marginPct);
  const minHourlyRate =
    totalBillableHours > 0 ? minRevenue / totalBillableHours : 0;

  return {
    totalBillableHours,
    minRevenue,
    minHourlyRate: Number.isFinite(minHourlyRate) ? minHourlyRate : 0,
    isValid: true,
  };
}
