/**
 * Break-even calculator: fixedCosts / (price - variableCost)
 */
export interface BreakEvenInput {
  fixedCosts: number;
  price: number;
  variableCost: number;
}

export interface BreakEvenResult {
  breakEvenUnits: number;
  isValid: boolean;
}

export function calculateBreakEven(input: BreakEvenInput): BreakEvenResult {
  const { fixedCosts, price, variableCost } = input;
  const contribution = price - variableCost;
  if (!Number.isFinite(fixedCosts) || fixedCosts < 0 || !Number.isFinite(contribution) || contribution <= 0) {
    return { breakEvenUnits: 0, isValid: false };
  }
  return {
    breakEvenUnits: fixedCosts / contribution,
    isValid: true,
  };
}
