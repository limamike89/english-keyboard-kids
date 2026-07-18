import { ScoringConfig, DEFAULT_SCORING_CONFIG } from './scoring-config'
import { GameResult } from '../core/types'

export class ScoringSystem {
  private config: ScoringConfig

  constructor(config?: Partial<ScoringConfig>) {
    this.config = { ...DEFAULT_SCORING_CONFIG, ...config }
  }

  getConfig(): ScoringConfig {
    return { ...this.config }
  }

  updateConfig(partial: Partial<ScoringConfig>): void {
    this.config = { ...this.config, ...partial }
  }

  calculatePoints(attemptNumber: number): number {
    const idx = Math.min(attemptNumber - 1, this.config.pointsPerAttempt.length - 1)
    return this.config.pointsPerAttempt[Math.max(0, idx)]
  }

  calculateStreakBonus(streak: number): number {
    if (
      streak > 0 &&
      streak % this.config.streakBonusEvery === 0
    ) {
      return this.config.streakBonusPoints
    }
    return 0
  }

  calculateStars(accuracy: number): number {
    const thresholds = this.config.starThresholds
    if (accuracy >= thresholds[2]) return 3
    if (accuracy >= thresholds[1]) return 2
    if (accuracy >= thresholds[0]) return 1
    return 0
  }

  calculateXp(stars: number): number {
    const idx = Math.min(Math.max(stars - 1, 0), this.config.xpPerStar.length - 1)
    return stars > 0 ? this.config.xpPerStar[idx] : 0
  }

  calculateCoins(stars: number): number {
    const idx = Math.min(Math.max(stars - 1, 0), this.config.coinsPerStar.length - 1)
    return stars > 0 ? this.config.coinsPerStar[idx] : 0
  }

  buildResult(params: {
    totalScore: number
    totalCorrect: number
    totalIncorrect: number
    bestStreak: number
    totalTimeMs: number
    avgTimePerQuestionMs: number
  }): GameResult {
    const total = params.totalCorrect + params.totalIncorrect
    const accuracy = total > 0 ? params.totalCorrect / total : 0
    const stars = this.calculateStars(accuracy)

    return {
      totalScore: params.totalScore,
      totalCorrect: params.totalCorrect,
      totalIncorrect: params.totalIncorrect,
      bestStreak: params.bestStreak,
      stars,
      xpEarned: this.calculateXp(stars),
      coinsEarned: this.calculateCoins(stars),
      accuracy: Math.round(accuracy * 100) / 100,
      totalTimeMs: params.totalTimeMs,
      avgTimePerQuestionMs: params.avgTimePerQuestionMs,
    }
  }
}
