import { PrismaClient } from '@prisma/client'
import type { MetricSummary } from '../types'

export class MetricsProcessor {
  constructor(private prisma: PrismaClient) {}

  async computeMetric(userId: string): Promise<MetricSummary> {
    const stats = await this.prisma.userStats.findMany({
      where: { userId },
    })

    const totalCorrect = stats.reduce((s, st) => s + st.totalCorrect, 0)
    const totalIncorrect = stats.reduce((s, st) => s + st.totalIncorrect, 0)
    const total = totalCorrect + totalIncorrect
    const totalXp = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, coins: true },
    })

    const avgTimes = stats
      .filter((s) => s.avgResponseTime !== null)
      .map((s) => Number(s.avgResponseTime))

    const avgResponseTimeMs =
      avgTimes.length > 0
        ? avgTimes.reduce((a, b) => a + b, 0) / avgTimes.length
        : 0

    return {
      totalGames: stats.reduce((s, st) => s + st.gamesPlayed, 0),
      totalCorrect,
      totalIncorrect,
      totalQuestions: total,
      accuracy: total > 0 ? totalCorrect / total : 0,
      bestStreak: Math.max(...stats.map((s) => s.bestStreak), 0),
      currentStreak: Math.max(...stats.map((s) => s.currentStreak), 0),
      totalXp: totalXp?.xp ?? 0,
      totalCoins: totalXp?.coins ?? 0,
      avgResponseTimeMs,
      gamesCompleted: stats.reduce((s, st) => s + st.gamesPlayed, 0),
    }
  }

  async refreshStudentMetric(userId: string): Promise<void> {
    const metric = await this.computeMetric(userId)

    await this.prisma.studentMetric.upsert({
      where: { userId },
      create: { userId, ...metric },
      update: metric,
    })
  }

  async getStudentMetric(userId: string): Promise<MetricSummary | null> {
    const stored = await this.prisma.studentMetric.findUnique({
      where: { userId },
    })
    if (!stored) return null

    return {
      totalGames: stored.totalGames,
      totalCorrect: stored.totalCorrect,
      totalIncorrect: stored.totalIncorrect,
      totalQuestions: stored.totalQuestions,
      accuracy: stored.accuracy,
      bestStreak: stored.bestStreak,
      currentStreak: stored.currentStreak,
      totalXp: stored.totalXp,
      totalCoins: stored.totalCoins,
      avgResponseTimeMs: stored.avgResponseTimeMs,
      gamesCompleted: stored.gamesCompleted,
    }
  }
}
