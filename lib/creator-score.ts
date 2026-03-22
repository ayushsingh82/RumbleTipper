/**
 * Creator alpha scoring for RumbleTipper.
 * Demo: deterministic mock from creator id. Replace with real metrics (view velocity, engagement) when Rumble data is available.
 */

export type AlphaResponse = {
  creatorId: string;
  alphaScore: number;
  /** Suggested tip amount in ETH (Base Sepolia demo). */
  suggestedTip: number;
  metrics: { views: number; engagement: number };
  network: string;
  token: string;
};

export function getAlphaScore(creatorId: string): AlphaResponse {
  const hash = creatorId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const alphaScore = 0.5 + (hash % 50) / 100; // 0.50–0.99
  const suggestedTip = [0.0005, 0.001, 0.002, 0.005][hash % 4];
  const views = 5000 + (hash % 20000);
  const engagement = 0.02 + (hash % 30) / 1000;

  return {
    creatorId,
    alphaScore: Math.round(alphaScore * 100) / 100,
    suggestedTip,
    metrics: {
      views,
      engagement: Math.round(engagement * 100) / 100,
    },
    network: "Base Sepolia",
    token: "ETH",
  };
}
