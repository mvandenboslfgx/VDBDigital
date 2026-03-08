/**
 * Price increase profit calculator.
 * Computes new price, revenue at same volume, and extra profit from a price increase.
 * Used for "Price increase profit" in the dashboard.
 */

export interface PriceIncreaseInput {
  /** Current price per unit (€). */
  currentPrice: number;
  /** Number of units sold (e.g. per month or year). */
  unitsSold: number;
  /** Price increase as a percentage (e.g. 10 for 10%). */
  increasePercent: number;
}

export interface PriceIncreaseResult {
  /** New price after increase. */
  newPrice: number;
  /** Current revenue (currentPrice × unitsSold). */
  currentRevenue: number;
  /** New revenue at same volume (newPrice × unitsSold). */
  newRevenueSameVolume: number;
  /** Extra profit from the increase (newRevenueSameVolume - currentRevenue). */
  profitIncrease: number;
  /** Whether inputs were valid (no negative/NaN). */
  isValid: boolean;
}

/**
 * Calculate the impact of a price increase on revenue and profit.
 * Safe: returns zeros and isValid false on invalid input or division issues.
 */
export function calculatePriceIncrease(input: PriceIncreaseInput): PriceIncreaseResult {
  const { currentPrice, unitsSold, increasePercent } = input;

  const validPrice = Number.isFinite(currentPrice) && currentPrice >= 0;
  const validUnits = Number.isFinite(unitsSold) && unitsSold >= 0;
  const validPct = Number.isFinite(increasePercent) && increasePercent >= 0;

  if (!validPrice || !validUnits || !validPct) {
    return {
      newPrice: 0,
      currentRevenue: 0,
      newRevenueSameVolume: 0,
      profitIncrease: 0,
      isValid: false,
    };
  }

  const pct = Math.min(100, increasePercent) / 100;
  const newPrice = currentPrice * (1 + pct);
  const currentRevenue = currentPrice * unitsSold;
  const newRevenueSameVolume = newPrice * unitsSold;
  const profitIncrease = newRevenueSameVolume - currentRevenue;

  return {
    newPrice,
    currentRevenue,
    newRevenueSameVolume,
    profitIncrease,
    isValid: true,
  };
}
