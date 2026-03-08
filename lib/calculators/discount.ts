/**
 * Discount impact calculator
 */
export interface DiscountImpactInput {
  originalPrice: number;
  discountPercent: number;
  quantity?: number;
}

export interface DiscountImpactResult {
  discountedPrice: number;
  totalDiscount: number;
  totalPrice: number;
  marginLostPercent: number;
}

export function calculateDiscountImpact(input: DiscountImpactInput): DiscountImpactResult {
  const { originalPrice, discountPercent, quantity = 1 } = input;
  if (!Number.isFinite(originalPrice) || originalPrice < 0 || !Number.isFinite(discountPercent)) {
    return {
      discountedPrice: 0,
      totalDiscount: 0,
      totalPrice: 0,
      marginLostPercent: 0,
    };
  }
  const pct = Math.max(0, Math.min(100, discountPercent)) / 100;
  const discountedPrice = originalPrice * (1 - pct);
  const totalDiscount = (originalPrice - discountedPrice) * quantity;
  const totalPrice = discountedPrice * quantity;
  const marginLostPercent = originalPrice > 0 ? pct * 100 : 0;
  return {
    discountedPrice,
    totalDiscount,
    totalPrice,
    marginLostPercent,
  };
}
