/**
 * Metrics calculation utilities for influencer analytics
 */

/**
 * Calculate EMV (Earned Media Value)
 * Formula: [Views × 0.03] + [Likes × 0.1] + [Comments × 0.4]
 */
export const calculateEMV = (views: number, likes: number, comments: number): number => {
  return (views * 0.03) + (likes * 0.1) + (comments * 0.4);
};

/**
 * Calculate marketing cost based on follower count and type
 * Returns 0 for '무가' (free) campaigns
 */
export const calculateCost = (
  followerCount: number,
  followerType: string,
  costType: string
): number => {
  if (costType === '무가') return 0;

  const baseRate = followerType === '메가' ? 0.05 :
                   followerType === '매크로' ? 0.08 :
                   followerType === '마이크로' ? 0.12 : 0.15;

  return Math.floor(followerCount * baseRate);
};

/**
 * Calculate ROAS (Return on Ad Spend)
 * Formula: (EMV / Cost) × 100
 * For free campaigns (cost = 0), returns EMV as the ROAS value
 */
export const calculateROAS = (emv: number, cost: number): number => {
  if (cost === 0) return emv; // 무가의 경우 EMV를 ROAS로 사용
  return Math.floor((emv / cost) * 100);
};

/**
 * Calculate all metrics for an influencer
 * This helper function calculates EMV, cost, and ROAS all at once
 */
export const calculateAllMetrics = (data: {
  views: number;
  likes: number;
  comments: number;
  followerCount: number;
  followerType: '메가' | '매크로' | '마이크로' | '나노';
  costType: '무가' | '유가';
}): {
  emv: number;
  cost: number;
  roas: number;
} => {
  const cost = calculateCost(data.followerCount, data.followerType, data.costType);
  const emv = calculateEMV(data.views, data.likes, data.comments);
  const roas = calculateROAS(emv, cost);

  return {
    emv: Math.floor(emv),
    cost,
    roas
  };
};