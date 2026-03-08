/**
 * ROI calculator: (profit - investment) / investment
 */
export interface RoiInput {
  profit: number;
  investment: number;
}

export interface RoiResult {
  roi: number;
  roiPercent: number;
}

export function calculateRoi(input: RoiInput): RoiResult {
  const { profit, investment } = input;
  if (!Number.isFinite(investment) || investment <= 0) {
    return { roi: 0, roiPercent: 0 };
  }
  const roi = (profit - investment) / investment;
  return {
    roi,
    roiPercent: roi * 100,
  };
}
