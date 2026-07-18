import { PrismaClient } from '@prisma/client'
import type { DailyActivity, TrendData } from '../types'

export class ProgressQuery {
  constructor(private prisma: PrismaClient) {}

  async getDailyActivity(userId: string, days = 30): Promise<DailyActivity[]> {
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)

    const events = await this.prisma.analyticsEvent.findMany({
      where: {
        userId,
        createdAt: { gte: fromDate },
        eventType: { in: ['answer_correct', 'answer_incorrect', 'game_completed', 'game_started'] },
      },
      orderBy: { createdAt: 'asc' },
    })

    const dailyMap = new Map<string, DailyActivity>()

    for (const event of events) {
      const dateKey = event.createdAt.toISOString().slice(0, 10)
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          gamesPlayed: 0,
          questionsAnswered: 0,
          correct: 0,
          incorrect: 0,
          xpEarned: 0,
        })
      }

      const day = dailyMap.get(dateKey)!
      if (event.eventType === 'game_started') day.gamesPlayed++
      if (event.eventType === 'answer_correct') {
        day.questionsAnswered++
        day.correct++
      }
      if (event.eventType === 'answer_incorrect') {
        day.questionsAnswered++
        day.incorrect++
      }
      if (event.eventType === 'game_completed') {
        const props = event.properties as { score?: number } | null
        day.xpEarned += props?.score ?? 0
      }
    }

    return Array.from(dailyMap.values())
  }

  async getTrends(userId: string, days = 30): Promise<TrendData> {
    const activity = await this.getDailyActivity(userId, days)

    return {
      dates: activity.map((d) => d.date),
      accuracy: activity.map((d) =>
        d.questionsAnswered > 0 ? d.correct / d.questionsAnswered : 0,
      ),
      gamesPlayed: activity.map((d) => d.gamesPlayed),
      avgResponseTime: activity.map(() => 0),
    }
  }

  async getRecommendations(userId: string): Promise<string[]> {
    const weakLetters = await this.getWeakestItems(userId, 'letterDifficulty', 'letter', 3)
    const weakNumbers = await this.getWeakestItems(userId, 'numberDifficulty', 'number', 3)

    const recommendations: string[] = []

    if (weakLetters.length > 0) {
      recommendations.push(
        `Practice the letter${weakLetters.length > 1 ? 's' : ''}: ${weakLetters.join(', ')}`,
      )
    }

    if (weakNumbers.length > 0) {
      recommendations.push(
        `Practice the number${weakNumbers.length > 1 ? 's' : ''}: ${weakNumbers.join(', ')}`,
      )
    }

    const metric = await this.prisma.studentMetric.findUnique({ where: { userId } })
    if (metric && metric.currentStreak > 0 && metric.currentStreak < 3) {
      recommendations.push('Try to complete 3 days in a row to build your streak!')
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! Keep practicing to maintain your skills.')
    }

    return recommendations
  }

  private async getWeakestItems(
    userId: string,
    table: string,
    field: string,
    limit: number,
  ): Promise<string[]> {
    const rows = await (this.prisma as any)[table].findMany({
      where: { userId, attempts: { gte: 2 } },
      orderBy: { accuracy: 'asc' },
      take: limit,
    })

    return rows.map((r: Record<string, unknown>) => r[field] as string)
  }
}
