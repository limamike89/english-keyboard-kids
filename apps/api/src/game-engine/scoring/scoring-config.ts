export interface ScoringConfig {
  pointsPerAttempt: [number, number, number, number]
  streakBonusEvery: number
  streakBonusPoints: number
  xpPerStar: [number, number, number]
  coinsPerStar: [number, number, number]
  starThresholds: [number, number, number]
}

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  pointsPerAttempt: [10, 7, 5, 3],
  streakBonusEvery: 5,
  streakBonusPoints: 3,
  xpPerStar: [20, 40, 60],
  coinsPerStar: [5, 10, 15],
  starThresholds: [0.5, 0.75, 1.0],
}
