/**
 * Pricing simulator: price change, conversion rate, revenue impact
 */
export interface PricingSimulatorInput {
  currentPrice: number;
  newPrice: number;
  currentConversionRate: number; // e.g. 0.03 = 3%
  volume: number; // e.g. monthly visitors or leads
}

export interface PricingSimulatorResult {
  currentRevenue: number;
  newRevenue: number;
  revenueChange: number;
  revenueChangePercent: number;
}

export function calculatePricingImpact(input: PricingSimulatorInput): PricingSimulatorResult {
  const { currentPrice, newPrice, currentConversionRate, volume } = input;
  const currentRevenue = currentPrice * (volume * currentConversionRate);
  const newRevenue = newPrice * (volume * currentConversionRate);
  const revenueChange = newRevenue - currentRevenue;
  const revenueChangePercent = currentRevenue > 0 ? (revenueChange / currentRevenue) * 100 : 0;
  return {
    currentRevenue,
    newRevenue,
    revenueChange,
    revenueChangePercent,
  };
}
