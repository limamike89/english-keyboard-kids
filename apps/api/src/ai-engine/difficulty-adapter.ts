import { PrismaClient } from '@prisma/client'
import type { DifficultyConfig } from './types'

export class DifficultyAdapter {
  private config: DifficultyConfig = {
    baseDifficulty: 0.5,
    adaptiveFactor: 0.15,
    minDifficulty: 0.1,
    maxDifficulty: 1.0,
  }

  constructor(private prisma: PrismaClient) {}

  setConfig(config: Partial<DifficultyConfig>): void {
    this.config = { ...this.config, ...config }
  }

  async computeDifficulty(userId: string): Promise<number> {
    const stats = await this.prisma.userStats.findMany({
      where: { userId },
    })

    const totalCorrect = stats.reduce((s, st) => s + st.totalCorrect, 0)
    const totalIncorrect = stats.reduce((s, st) => s + st.totalIncorrect, 0)
    const total = totalCorrect + totalIncorrect

    if (total === 0) return this.config.baseDifficulty

    const accuracy = totalCorrect / total
    const streak = Math.max(...stats.map((s) => s.currentStreak), 0)

    const diff = this.config.baseDifficulty +
      (accuracy - 0.5) * this.config.adaptiveFactor +
      Math.min(streak, 10) * 0.01

    return Math.max(this.config.minDifficulty, Math.min(this.config.maxDifficulty, diff))
  }

  async shouldIncreaseDifficulty(userId: string, threshold = 0.8): Promise<boolean> {
    const recentAnswers = await this.prisma.userAnswer.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    if (recentAnswers.length < 5) return false

    const recentCorrect = recentAnswers.filter((a) => a.isCorrect).length
    const accuracy = recentCorrect / recentAnswers.length

    return accuracy >= threshold
  }

  async shouldDecreaseDifficulty(userId: string, threshold = 0.4): Promise<boolean> {
    const recentAnswers = await this.prisma.userAnswer.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    if (recentAnswers.length < 3) return false

    const recentCorrect = recentAnswers.filter((a) => a.isCorrect).length
    const accuracy = recentCorrect / recentAnswers.length

    return accuracy <= threshold
  }

  getQuestionDifficulty(difficultyLevel: number): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
    if (difficultyLevel < 0.35) return 'BEGINNER'
    if (difficultyLevel < 0.65) return 'INTERMEDIATE'
    return 'ADVANCED'
  }
}
