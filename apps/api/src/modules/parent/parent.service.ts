import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class ParentService {
  constructor(private prisma: PrismaService) {}

  async getChildren(parentId: string) {
    const links = await this.prisma.parentChild.findMany({
      where: { parentId },
      include: {
        child: {
          select: {
            id: true,
            displayName: true,
            username: true,
            xp: true,
            coins: true,
            createdAt: true,
          },
        },
      },
    })

    return links.map((l) => ({
      ...l.child,
      relationship: l.relationship,
      linkedAt: l.createdAt,
    }))
  }

  async getChildProgress(parentId: string, childId: string) {
    await this.verifyChildAccess(parentId, childId)

    const [stats, progress, metric, dailyStreak, achievements] = await Promise.all([
      this.prisma.userStats.findMany({
        where: { userId: childId },
      }),
      this.prisma.userProgress.findMany({
        where: { userId: childId },
        include: { lesson: { select: { title: true, mode: true } } },
        orderBy: { lastPlayedAt: 'desc' },
      }),
      this.prisma.studentMetric.findUnique({ where: { userId: childId } }),
      this.prisma.dailyStreak.findMany({
        where: { userId: childId },
        orderBy: { date: 'desc' },
        take: 30,
      }),
      this.prisma.userAchievement.findMany({
        where: { userId: childId, unlockedAt: { not: null } },
        include: { achievement: { select: { name: true, icon: true, description: true } } },
      }),
    ])

    const totalCorrect = stats.reduce((s, st) => s + st.totalCorrect, 0)
    const totalIncorrect = stats.reduce((s, st) => s + st.totalIncorrect, 0)
    const total = totalCorrect + totalIncorrect

    return {
      stats: {
        totalGames: stats.reduce((s, st) => s + st.gamesPlayed, 0),
        totalCorrect,
        totalIncorrect,
        totalQuestions: total,
        accuracy: total > 0 ? totalCorrect / total : 0,
      },
      metric,
      progress,
      dailyStreak,
      achievements,
      currentStreak: Math.max(...stats.map((s) => s.currentStreak), 0),
    }
  }

  async getChildAnalytics(parentId: string, childId: string, days = 30) {
    await this.verifyChildAccess(parentId, childId)

    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)

    const [weakestLetters, weakestNumbers, recentActivity] = await Promise.all([
      this.getWeakestLetters(childId),
      this.getWeakestNumbers(childId),
      this.getRecentActivity(childId, fromDate),
    ])

    return { weakestLetters, weakestNumbers, recentActivity }
  }

  async getSettings(parentId: string) {
    const settings = await this.prisma.parentSettings.findUnique({
      where: { parentId },
    })
    return settings ?? { dailyTimeLimit: null, contentRestrictions: null, enableReports: true, reportFrequency: 'weekly' }
  }

  async updateSettings(parentId: string, data: { dailyTimeLimit?: number; contentRestrictions?: Record<string, unknown>; enableReports?: boolean; reportFrequency?: string }) {
    const createData: Record<string, unknown> = { parentId }
    const updateData: Record<string, unknown> = {}
    if (data.dailyTimeLimit !== undefined) { createData.dailyTimeLimit = data.dailyTimeLimit; updateData.dailyTimeLimit = data.dailyTimeLimit }
    if (data.contentRestrictions !== undefined) { createData.contentRestrictions = data.contentRestrictions as any; updateData.contentRestrictions = data.contentRestrictions as any }
    if (data.enableReports !== undefined) { createData.enableReports = data.enableReports; updateData.enableReports = data.enableReports }
    if (data.reportFrequency !== undefined) { createData.reportFrequency = data.reportFrequency; updateData.reportFrequency = data.reportFrequency }

    const settings = await this.prisma.parentSettings.upsert({
      where: { parentId },
      create: createData as any,
      update: updateData as any,
    })
    return settings
  }

  async getReports(parentId: string, childId?: string) {
    const where: Record<string, unknown> = { parentId }
    if (childId) where.childId = childId

    return this.prisma.report.findMany({
      where,
      orderBy: { generatedAt: 'desc' },
      take: 20,
    })
  }

  async generateReport(parentId: string, childId: string, period: string) {
    await this.verifyChildAccess(parentId, childId)

    const now = new Date()
    const periodStart = new Date(now)
    if (period === 'weekly') periodStart.setDate(periodStart.getDate() - 7)
    else if (period === 'monthly') periodStart.setMonth(periodStart.getMonth() - 1)
    else periodStart.setDate(periodStart.getDate() - 1)

    const events = await this.prisma.analyticsEvent.findMany({
      where: {
        userId: childId,
        createdAt: { gte: periodStart },
      },
    })

    const correct = events.filter((e) => e.eventType === 'answer_correct').length
    const incorrect = events.filter((e) => e.eventType === 'answer_incorrect').length
    const gamesStarted = events.filter((e) => e.eventType === 'game_started').length
    const gamesCompleted = events.filter((e) => e.eventType === 'game_completed').length

    const data = {
      period,
      periodStart,
      periodEnd: now,
      summary: {
        totalEvents: events.length,
        correctAnswers: correct,
        incorrectAnswers: incorrect,
        accuracy: correct + incorrect > 0 ? correct / (correct + incorrect) : 0,
        gamesStarted,
        gamesCompleted,
        completionRate: gamesStarted > 0 ? gamesCompleted / gamesStarted : 0,
      },
    }

    return this.prisma.report.create({
      data: { parentId, childId, period, periodStart, periodEnd: now, data: JSON.parse(JSON.stringify(data)) },
    })
  }

  private async verifyChildAccess(parentId: string, childId: string): Promise<void> {
    const link = await this.prisma.parentChild.findUnique({
      where: { parentId_childId: { parentId, childId } },
    })
    if (!link) {
      throw new NotFoundException('Child not linked to this parent')
    }
  }

  private async getWeakestLetters(userId: string) {
    const rows = await this.prisma.letterDifficulty.findMany({
      where: { userId, attempts: { gte: 2 } },
      orderBy: { accuracy: 'asc' },
      take: 5,
    })
    return rows.map((r) => ({ item: r.letter, attempts: r.attempts, correct: r.correct, incorrect: r.incorrect, accuracy: r.accuracy }))
  }

  private async getWeakestNumbers(userId: string) {
    const rows = await this.prisma.numberDifficulty.findMany({
      where: { userId, attempts: { gte: 2 } },
      orderBy: { accuracy: 'asc' },
      take: 5,
    })
    return rows.map((r) => ({ item: r.number, attempts: r.attempts, correct: r.correct, incorrect: r.incorrect, accuracy: r.accuracy }))
  }

  private async getRecentActivity(userId: string, fromDate: Date) {
    const events = await this.prisma.analyticsEvent.findMany({
      where: {
        userId,
        createdAt: { gte: fromDate },
        eventType: { in: ['answer_correct', 'answer_incorrect', 'game_started', 'game_completed'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return events.map((e) => ({
      type: e.eventType,
      at: e.createdAt,
      details: e.properties,
    }))
  }
}
