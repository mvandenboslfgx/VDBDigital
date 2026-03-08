/**
 * Finance check (loan) calculator.
 * Computes monthly payment and total cost for a fixed-term loan (amortization).
 * Used for "Finance check" in the dashboard.
 */

export interface FinanceCheckInput {
  /** Loan amount (€). */
  loanAmount: number;
  /** Annual interest rate as percentage (e.g. 6 for 6%). */
  interestRatePercent: number;
  /** Term in years. */
  termYears: number;
}

export interface FinanceCheckResult {
  /** Monthly payment (€). */
  monthlyPayment: number;
  /** Total amount repaid over the term. */
  totalRepayment: number;
  /** Total interest paid. */
  totalInterest: number;
  /** Number of payments (termYears × 12). */
  numberOfPayments: number;
  /** Whether inputs were valid (positive amount, term, non-negative rate). */
  isValid: boolean;
}

/**
 * Calculate loan monthly payment and total cost using standard amortization.
 * Formula: P = L * [r(1+r)^n] / [(1+r)^n - 1], where r = monthly rate, n = number of payments.
 * Safe: when rate is 0, uses P = L/n; avoids NaN and division by zero.
 */
export function calculateFinanceCheck(input: FinanceCheckInput): FinanceCheckResult {
  const { loanAmount, interestRatePercent, termYears } = input;

  const validAmount = Number.isFinite(loanAmount) && loanAmount > 0;
  const validRate = Number.isFinite(interestRatePercent) && interestRatePercent >= 0;
  const validTerm = Number.isFinite(termYears) && termYears > 0;

  if (!validAmount || !validRate || !validTerm) {
    return {
      monthlyPayment: 0,
      totalRepayment: 0,
      totalInterest: 0,
      numberOfPayments: 0,
      isValid: false,
    };
  }

  const numPayments = Math.max(1, Math.floor(termYears * 12));
  const monthlyRate = interestRatePercent / 100 / 12;

  let monthlyPayment: number;
  if (monthlyRate <= 0 || !Number.isFinite(monthlyRate)) {
    monthlyPayment = loanAmount / numPayments;
  } else {
    const factor = Math.pow(1 + monthlyRate, numPayments);
    if (!Number.isFinite(factor) || factor <= 1) {
      monthlyPayment = loanAmount / numPayments;
    } else {
      monthlyPayment = (loanAmount * monthlyRate * factor) / (factor - 1);
    }
  }

  if (!Number.isFinite(monthlyPayment) || monthlyPayment < 0) {
    return {
      monthlyPayment: 0,
      totalRepayment: 0,
      totalInterest: 0,
      numberOfPayments: numPayments,
      isValid: false,
    };
  }

  const totalRepayment = monthlyPayment * numPayments;
  const totalInterest = totalRepayment - loanAmount;

  return {
    monthlyPayment,
    totalRepayment,
    totalInterest: totalInterest >= 0 ? totalInterest : 0,
    numberOfPayments: numPayments,
    isValid: true,
  };
}
